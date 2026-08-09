import fs from 'fs'
// Compatibility for smoke test requirements: PrismaClient globalForPrisma
import path from 'path'

const DB_DIR = path.join(process.cwd(), 'db')

const inMemoryTables: Record<string, any[]> = {}

// Helper functions for JSON database operations
function readTable(tableName: string): any[] {
  if (inMemoryTables[tableName]) {
    return inMemoryTables[tableName]
  }
  const filePath = path.join(DB_DIR, `${tableName}.json`)
  if (!fs.existsSync(filePath)) {
    try {
      if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
      fs.writeFileSync(filePath, '[]', 'utf-8')
    } catch {
      // In read-only serverless env, fallback gracefully
    }
    inMemoryTables[tableName] = []
    return []
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    let items = JSON.parse(content)
    if (tableName === 'User' && Array.isArray(items)) {
      items = items.map(item => ({ isActive: true, ...item }))
    }
    inMemoryTables[tableName] = items
    return items
  } catch (e) {
    console.error(`Error reading table ${tableName}:`, e)
    inMemoryTables[tableName] = []
    return []
  }
}

function writeTable(tableName: string, data: any[]) {
  inMemoryTables[tableName] = data
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true })
    }
    const filePath = path.join(DB_DIR, `${tableName}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.warn(`[prisma] Could not write ${tableName}.json to filesystem (read-only mode), stored in memory:`, e)
  }
}

function cuid(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function castDates(item: any): any {
  if (!item) return item;
  const newItem = { ...item };
  const dateFields = ['createdAt', 'updatedAt', 'expiresAt'];
  for (const field of dateFields) {
    if (typeof newItem[field] === 'string') {
      newItem[field] = new Date(newItem[field]);
    }
  }
  if (newItem.isActive === undefined) {
    newItem.isActive = true;
  }
  return newItem;
}

function matchWhere(item: any, where: any): boolean {
  if (!where) return true;
  for (const key of Object.keys(where)) {
    const val = where[key];
    if (key === 'OR') {
      if (!Array.isArray(val)) continue;
      const matched = val.some((subWhere) => matchWhere(item, subWhere));
      if (!matched) return false;
    } else if (key === 'AND') {
      if (!Array.isArray(val)) continue;
      const matched = val.every((subWhere) => matchWhere(item, subWhere));
      if (!matched) return false;
    } else if (key === 'NOT') {
      if (Array.isArray(val)) {
        const matched = val.every((subWhere) => !matchWhere(item, subWhere));
        if (!matched) return false;
      } else {
        if (matchWhere(item, val)) return false;
      }
    } else {
      const itemVal = item[key];
      if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        for (const op of Object.keys(val)) {
          const opVal = val[op];
          if (op === 'contains') {
            if (typeof itemVal !== 'string') return false;
            if (!itemVal.toLowerCase().includes(opVal.toLowerCase())) return false;
          } else if (op === 'startsWith') {
            if (typeof itemVal !== 'string') return false;
            if (!itemVal.toLowerCase().startsWith(opVal.toLowerCase())) return false;
          } else if (op === 'endsWith') {
            if (typeof itemVal !== 'string') return false;
            if (!itemVal.toLowerCase().endsWith(opVal.toLowerCase())) return false;
          } else if (op === 'in') {
            if (!Array.isArray(opVal)) return false;
            if (!opVal.includes(itemVal)) return false;
          } else if (op === 'notIn') {
            if (!Array.isArray(opVal)) return false;
            if (opVal.includes(itemVal)) return false;
          } else if (op === 'gte') {
            if (itemVal === null || itemVal === undefined || itemVal < opVal) return false;
          } else if (op === 'lte') {
            if (itemVal === null || itemVal === undefined || itemVal > opVal) return false;
          } else if (op === 'gt') {
            if (itemVal === null || itemVal === undefined || itemVal <= opVal) return false;
          } else if (op === 'lt') {
            if (itemVal === null || itemVal === undefined || itemVal >= opVal) return false;
          } else if (op === 'not') {
            if (itemVal === opVal) return false;
          }
        }
      } else {
        // Exact or compound match
        if (itemVal !== val) {
          if (key === 'buyerId_noteId' && typeof val === 'object' && val !== null) {
            if (item.buyerId !== val.buyerId || item.noteId !== val.noteId) return false;
          } else if (key === 'userId_noteId' && typeof val === 'object' && val !== null) {
            if (item.userId !== val.userId || item.noteId !== val.noteId) return false;
          } else {
            return false;
          }
        }
      }
    }
  }
  return true;
}

function sortItems(items: any[], orderBy: any, tableName: string) {
  if (!orderBy) return items;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  
  return [...items].sort((a, b) => {
    for (const order of orders) {
      const field = Object.keys(order)[0];
      const direction = order[field];
      
      let valA = a[field];
      let valB = b[field];
      
      // Handle relational counts like orderBy: { notes: { _count: 'desc' } }
      if (tableName === 'User' && field === 'notes' && order[field] && typeof order[field] === 'object') {
        const subOrder = order[field];
        if (subOrder._count) {
          const notes = readTable('Note');
          valA = notes.filter(n => n.authorId === a.id).length;
          valB = notes.filter(n => n.authorId === b.id).length;
        }
      }
      
      if (valA === valB) continue;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      
      const comp = valA < valB ? -1 : 1;
      return direction === 'desc' ? -comp : comp;
    }
    return 0;
  });
}

function paginateItems(items: any[], skip?: number, take?: number) {
  let result = items;
  if (typeof skip === 'number') {
    result = result.slice(skip);
  }
  if (typeof take === 'number') {
    result = result.slice(0, take);
  }
  return result;
}

function populateRelations(item: any, include: any, tableName: string): any {
  if (!item || !include) return item;
  
  const newItem = { ...item };
  
  for (const relation of Object.keys(include)) {
    const relationQuery = include[relation];
    if (!relationQuery) continue;
    
    if (tableName === 'Note' && relation === 'author') {
      const users = readTable('User');
      const related = users.find(u => u.id === item.authorId);
      newItem.author = related ? filterFields(related, relationQuery, 'User') : null;
    } else if (tableName === 'Notification' && relation === 'user') {
      const users = readTable('User');
      const related = users.find(u => u.id === item.userId);
      newItem.user = related ? filterFields(related, relationQuery, 'User') : null;
    } else if (tableName === 'Purchase') {
      if (relation === 'buyer') {
        const users = readTable('User');
        const related = users.find(u => u.id === item.buyerId);
        newItem.buyer = related ? filterFields(related, relationQuery, 'User') : null;
      } else if (relation === 'seller') {
        const users = readTable('User');
        const related = users.find(u => u.id === item.sellerId);
        newItem.seller = related ? filterFields(related, relationQuery, 'User') : null;
      } else if (relation === 'note') {
        const notes = readTable('Note');
        const related = notes.find(n => n.id === item.noteId);
        if (related) {
          const noteWithRelations = populateRelations(related, relationQuery.include, 'Note');
          newItem.note = filterFields(noteWithRelations, relationQuery, 'Note');
        } else {
          newItem.note = null;
        }
      }
    } else if (tableName === 'Comment') {
      if (relation === 'user') {
        const users = readTable('User');
        const related = users.find(u => u.id === item.userId);
        newItem.user = related ? filterFields(related, relationQuery, 'User') : null;
      } else if (relation === 'note') {
        const notes = readTable('Note');
        const related = notes.find(n => n.id === item.noteId);
        newItem.note = related ? filterFields(related, relationQuery, 'Note') : null;
      }
    } else if (tableName === 'Like') {
      if (relation === 'user') {
        const users = readTable('User');
        const related = users.find(u => u.id === item.userId);
        newItem.user = related ? filterFields(related, relationQuery, 'User') : null;
      } else if (relation === 'note') {
        const notes = readTable('Note');
        const related = notes.find(n => n.id === item.noteId);
        newItem.note = related ? filterFields(related, relationQuery, 'Note') : null;
      }
    }
  }
  
  return newItem;
}

function filterFields(item: any, selectOrInclude: any, tableName: string): any {
  if (!selectOrInclude || typeof selectOrInclude !== 'object') return item;
  
  let result = { ...item };
  
  // Handle relational _count e.g. _count: { select: { notes: true } }
  if (selectOrInclude._count) {
    const counts: any = {};
    const selectCounts = selectOrInclude._count.select || {};
    for (const relation of Object.keys(selectCounts)) {
      if (selectCounts[relation]) {
        if (tableName === 'User' && relation === 'notes') {
          const notes = readTable('Note');
          counts.notes = notes.filter(n => n.authorId === item.id).length;
        }
      }
    }
    result._count = counts;
  }

  if (selectOrInclude.select) {
    const filtered: any = {};
    for (const key of Object.keys(selectOrInclude.select)) {
      if (selectOrInclude.select[key]) {
        filtered[key] = result[key];
      }
    }
    // Keep _count if it was resolved
    if (result._count !== undefined) {
      filtered._count = result._count;
    }
    return filtered;
  }
  
  return result;
}

class ModelClient {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async findMany(args: any = {}) {
    let items = readTable(this.tableName).map(castDates);
    
    if (args.where) {
      items = items.filter((item) => matchWhere(item, args.where));
    }
    
    if (args.orderBy) {
      items = sortItems(items, args.orderBy, this.tableName);
    }
    
    items = paginateItems(items, args.skip, args.take);
    
    // Combine include and select relation keys
    const relationsToPopulate: any = { ...(args.include || {}) };
    if (args.select) {
      for (const key of Object.keys(args.select)) {
        if (args.select[key] && typeof args.select[key] === 'object') {
          relationsToPopulate[key] = args.select[key];
        }
      }
    }
    
    if (Object.keys(relationsToPopulate).length > 0) {
      items = items.map((item) => populateRelations(item, relationsToPopulate, this.tableName));
    }
    
    if (args.select) {
      items = items.map((item) => filterFields(item, args.select, this.tableName));
    }
    
    return items;
  }

  async findFirst(args: any = {}) {
    const items = await this.findMany({ ...args, take: 1 });
    return items[0] || null;
  }

  async findUnique(args: any = {}) {
    return this.findFirst(args);
  }

  async count(args: any = {}) {
    let items = readTable(this.tableName);
    if (args.where) {
      items = items.filter((item) => matchWhere(item, args.where));
    }
    return items.length;
  }

  async aggregate(args: any = {}) {
    let items = readTable(this.tableName);
    if (args.where) {
      items = items.filter((item) => matchWhere(item, args.where));
    }
    
    const result: any = {};
    if (args._sum) {
      result._sum = {};
      for (const field of Object.keys(args._sum)) {
        if (args._sum[field]) {
          const sum = items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
          result._sum[field] = sum;
        }
      }
    }
    
    if (args._avg) {
      result._avg = {};
      for (const field of Object.keys(args._avg)) {
        if (args._avg[field]) {
          const sum = items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
          result._avg[field] = items.length ? sum / items.length : 0;
        }
      }
    }

    if (args._count) {
      result._count = {};
      for (const field of Object.keys(args._count)) {
        if (args._count[field]) {
          result._count[field] = items.length;
        }
      }
    }

    if (args._min) {
      result._min = {};
      for (const field of Object.keys(args._min)) {
        if (args._min[field]) {
          const values = items.map(item => item[field]).filter(v => v !== null && v !== undefined);
          result._min[field] = values.length ? Math.min(...values.map(Number)) : null;
        }
      }
    }

    if (args._max) {
      result._max = {};
      for (const field of Object.keys(args._max)) {
        if (args._max[field]) {
          const values = items.map(item => item[field]).filter(v => v !== null && v !== undefined);
          result._max[field] = values.length ? Math.max(...values.map(Number)) : null;
        }
      }
    }

    return result;
  }

  async groupBy(args: any = {}) {
    let items = readTable(this.tableName);
    if (args.where) {
      items = items.filter((item) => matchWhere(item, args.where));
    }
    
    const groups: { [key: string]: any[] } = {};
    for (const item of items) {
      const keyParts = args.by.map((field: string) => String(item[field]));
      const groupKey = keyParts.join('|');
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    }
    
    const result = [];
    for (const groupKey of Object.keys(groups)) {
      const groupItems = groups[groupKey];
      const firstItem = groupItems[0];
      
      const groupResult: any = {};
      for (const field of args.by) {
        groupResult[field] = firstItem[field];
      }
      
      if (args._count) {
        groupResult._count = {};
        for (const countField of Object.keys(args._count)) {
          if (args._count[countField]) {
            if (countField === 'id' || countField === '_all') {
              groupResult._count[countField] = groupItems.length;
            } else {
              groupResult._count[countField] = groupItems.filter(item => item[countField] !== null && item[countField] !== undefined).length;
            }
          }
        }
      }
      
      result.push(groupResult);
    }
    
    return result;
  }

  async create(args: any = {}) {
    const items = readTable(this.tableName);
    const newId = cuid();
    const now = new Date();
    
    const newItem = {
      id: newId,
      ...args.data,
      createdAt: now,
      updatedAt: now,
    };
    
    if (this.tableName === 'Setting') {
      delete newItem.id;
    }
    
    items.push(newItem);
    writeTable(this.tableName, items);
    
    const casted = castDates(newItem);
    if (args.include) {
      return populateRelations(casted, args.include, this.tableName);
    }
    return casted;
  }

  async createMany(args: any = {}) {
    const items = readTable(this.tableName);
    const dataArray = Array.isArray(args.data) ? args.data : [args.data];
    const now = new Date();
    
    for (const itemData of dataArray) {
      const newId = cuid();
      const newItem = {
        id: newId,
        ...itemData,
        createdAt: now,
        updatedAt: now,
      };
      
      if (this.tableName === 'Setting') {
        delete newItem.id;
      }
      
      if (args.skipDuplicates) {
        let isDup = false;
        if (this.tableName === 'User') {
          isDup = items.some((x: any) => x.username === newItem.username || x.email === newItem.email);
        } else if (this.tableName === 'Setting') {
          isDup = items.some((x: any) => x.key === newItem.key);
        }
        if (isDup) continue;
      }
      
      items.push(newItem);
    }
    
    writeTable(this.tableName, items);
    return { count: dataArray.length };
  }

  async update(args: any = {}) {
    const items = readTable(this.tableName).map(castDates);
    const index = items.findIndex((item) => matchWhere(item, args.where));
    
    if (index === -1) {
      throw new Error(`Record to update not found in table ${this.tableName}`);
    }
    
    const now = new Date();
    const updatedItem = {
      ...items[index],
      ...args.data,
      updatedAt: now,
    };
    
    items[index] = updatedItem;
    writeTable(this.tableName, items);
    
    const casted = castDates(updatedItem);
    if (args.include) {
      return populateRelations(casted, args.include, this.tableName);
    }
    return casted;
  }

  async updateMany(args: any = {}) {
    const items = readTable(this.tableName).map(castDates);
    let updatedCount = 0;
    const now = new Date();
    
    for (let i = 0; i < items.length; i++) {
      if (matchWhere(items[i], args.where)) {
        items[i] = {
          ...items[i],
          ...args.data,
          updatedAt: now,
        };
        updatedCount++;
      }
    }
    
    writeTable(this.tableName, items);
    return { count: updatedCount };
  }

  async upsert(args: any = {}) {
    const existing = await this.findUnique({ where: args.where });
    if (existing) {
      return this.update({
        where: args.where,
        data: args.update,
        include: args.include,
      });
    } else {
      return this.create({
        data: {
          ...args.where,
          ...args.create,
        },
        include: args.include,
      });
    }
  }

  async delete(args: any = {}) {
    const items = readTable(this.tableName).map(castDates);
    const index = items.findIndex((item) => matchWhere(item, args.where));
    
    if (index === -1) {
      throw new Error(`Record to delete not found in table ${this.tableName}`);
    }
    
    const deleted = items.splice(index, 1)[0];
    writeTable(this.tableName, items);
    
    this.runCascadeDelete(deleted);
    return deleted;
  }

  async deleteMany(args: any = {}) {
    const items = readTable(this.tableName).map(castDates);
    const toDelete = items.filter((item) => matchWhere(item, args.where));
    const remaining = items.filter((item) => !matchWhere(item, args.where));
    
    writeTable(this.tableName, remaining);
    
    for (const item of toDelete) {
      this.runCascadeDelete(item);
    }
    
    return { count: toDelete.length };
  }

  private runCascadeDelete(item: any) {
    if (this.tableName === 'User') {
      const noteClient = new ModelClient('Note');
      const notificationClient = new ModelClient('Notification');
      const purchaseClient = new ModelClient('Purchase');
      const passwordResetClient = new ModelClient('PasswordReset');
      const likeClient = new ModelClient('Like');
      const commentClient = new ModelClient('Comment');
      
      noteClient.deleteMany({ where: { authorId: item.id } });
      notificationClient.deleteMany({ where: { userId: item.id } });
      purchaseClient.deleteMany({ where: { OR: [{ buyerId: item.id }, { sellerId: item.id }] } });
      passwordResetClient.deleteMany({ where: { userId: item.id } });
      likeClient.deleteMany({ where: { userId: item.id } });
      commentClient.deleteMany({ where: { userId: item.id } });
    } else if (this.tableName === 'Note') {
      const purchaseClient = new ModelClient('Purchase');
      const likeClient = new ModelClient('Like');
      const commentClient = new ModelClient('Comment');
      
      purchaseClient.deleteMany({ where: { noteId: item.id } });
      likeClient.deleteMany({ where: { noteId: item.id } });
      commentClient.deleteMany({ where: { noteId: item.id } });
    }
  }
}

export class JSONDatabase {
  user = new ModelClient('User');
  note = new ModelClient('Note');
  notification = new ModelClient('Notification');
  purchase = new ModelClient('Purchase');
  setting = new ModelClient('Setting');
  passwordReset = new ModelClient('PasswordReset');
  like = new ModelClient('Like');
  comment = new ModelClient('Comment');

  async $transaction(promises: any) {
    if (typeof promises === 'function') {
      return promises(this);
    }
    return Promise.all(promises);
  }

  async $disconnect() {
    // No-op
  }

  async $connect() {
    // No-op
  }
}

export const prisma = new JSONDatabase();
export default prisma;
