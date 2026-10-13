import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

export function createMemoryD1() {
  const db = new DatabaseSync(":memory:");
  const schema = readFileSync(new URL("../../d1/schema.sql", import.meta.url), "utf8");
  db.exec(schema);
  return {
    prepare(sql) {
      const runWith = (params) => ({
        async first() {
          const stmt = db.prepare(sql);
          return stmt.get(...params) ?? null;
        },
        async all() {
          const stmt = db.prepare(sql);
          return { results: stmt.all(...params) };
        },
        async run() {
          const stmt = db.prepare(sql);
          stmt.run(...params);
          return { success: true };
        },
      });
      return {
        ...runWith([]),
        bind(...params) {
          return runWith(params);
        },
      };
    },
  };
}
