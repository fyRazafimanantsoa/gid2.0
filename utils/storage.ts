
import { Page, Block } from '../types';

let db: any = null;
const SQL_PATH = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm';
const DB_NAME = 'gid_storage';
const STORE_NAME = 'sqlite_db';

const openIDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getDBFromIDB = async (): Promise<Uint8Array | null> => {
  const idb = await openIDB();
  return new Promise((resolve) => {
    const transaction = idb.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('db_blob');
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
};

const saveDBToIDB = async (blob: Uint8Array) => {
  const idb = await openIDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = idb.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(blob, 'db_blob');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const initDB = async () => {
  if (db) return db;
  const initSqlJs = (window as any).initSqlJs;
  const SQL = await initSqlJs({ locateFile: () => SQL_PATH });
  
  const savedDB = await getDBFromIDB();
  if (savedDB) {
    db = new SQL.Database(savedDB);
  } else {
    db = new SQL.Database();
    db.run(`
      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        title TEXT,
        updatedAt INTEGER
      );
      CREATE TABLE IF NOT EXISTS blocks (
        id TEXT PRIMARY KEY,
        pageId TEXT,
        type TEXT,
        content TEXT,
        checked INTEGER,
        schedule TEXT,
        lastEditedAt INTEGER,
        metadata TEXT,
        sortOrder INTEGER,
        FOREIGN KEY(pageId) REFERENCES pages(id) ON DELETE CASCADE
      );
    `);
  }
  return db;
};

const persistDB = async () => {
  if (!db) return;
  const data = db.export();
  await saveDBToIDB(data);
};

export const savePages = async (pages: Page[]) => {
  const database = await initDB();
  database.run("DELETE FROM blocks");
  database.run("DELETE FROM pages");

  const insertPage = database.prepare("INSERT INTO pages (id, title, updatedAt) VALUES (?, ?, ?)");
  const insertBlock = database.prepare("INSERT INTO blocks (id, pageId, type, content, checked, schedule, lastEditedAt, metadata, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

  for (const page of pages) {
    insertPage.run([page.id, page.title, page.updatedAt]);
    page.blocks.forEach((block, index) => {
      insertBlock.run([
        block.id,
        page.id,
        block.type,
        block.content,
        block.checked ? 1 : 0,
        block.schedule || null,
        block.lastEditedAt || Date.now(),
        JSON.stringify(block.metadata || {}),
        index
      ]);
    });
  }
  insertPage.free();
  insertBlock.free();
  await persistDB();
};

export const loadPages = async (): Promise<Page[]> => {
  const database = await initDB();
  const pages: Page[] = [];
  
  try {
    const resPages = database.exec("SELECT * FROM pages ORDER BY updatedAt DESC");
    if (resPages.length === 0) return [];

    const pageRows = resPages[0].values;
    for (const pRow of pageRows) {
      const pageId = pRow[0] as string;
      const resBlocks = database.exec(`SELECT * FROM blocks WHERE pageId = '${pageId}' ORDER BY sortOrder ASC`);
      const blocks: Block[] = [];
      
      if (resBlocks.length > 0) {
        resBlocks[0].values.forEach((bRow: any) => {
          blocks.push({
            id: bRow[0],
            type: bRow[2],
            content: bRow[3],
            checked: bRow[4] === 1,
            schedule: bRow[5],
            lastEditedAt: bRow[6],
            metadata: JSON.parse(bRow[7] || '{}')
          });
        });
      }

      pages.push({
        id: pageId,
        title: pRow[1] as string,
        updatedAt: pRow[2] as number,
        blocks
      });
    }
  } catch (e) {
    console.error("Storage load error", e);
  }
  
  return pages;
};

export const getDBBlob = async () => {
  const database = await initDB();
  return database.export();
};
