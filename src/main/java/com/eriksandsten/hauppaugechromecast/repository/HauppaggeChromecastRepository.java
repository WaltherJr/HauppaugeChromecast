package com.eriksandsten.hauppaugechromecast.repository;

import org.rocksdb.RocksDB;
import org.rocksdb.RocksDBException;
import org.rocksdb.Options;
import org.springframework.stereotype.Repository;

import java.nio.charset.StandardCharsets;

@Repository
public class HauppaggeChromecastRepository {
      public String test() {
            // a static method that loads the RocksDB C++ library.
            RocksDB.loadLibrary();

            // the Options class contains a set of configurable DB options
            // that determines the behaviour of the database.
            try (final Options options = new Options().setCreateIfMissing(true)) {
                // a factory method that returns a RocksDB instance
                try (final RocksDB db = RocksDB.open(options, "database.rdb")) {
                    return doSomething(db);
                // do something
                }
            } catch (RocksDBException e) {
            // do some error handling
                return null;
            }
      }

      String doSomething(RocksDB db) {
          byte[] key1 = null;
            // some initialization for key1 and key2

          try {
              final byte[] value = db.get(key1);
              if (value != null) {  // value == null if key1 does not exist in db.
                  db.put(key1, "Hello world!".getBytes(StandardCharsets.UTF_8));
                  // db.put(key2, value);
              }

              return new String(value, StandardCharsets.UTF_8);

          } catch (RocksDBException e) {
              // error handling
              return null;
          }
      }
}
