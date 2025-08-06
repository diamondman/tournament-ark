#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

pub mod models;
pub mod schema;

extern crate tauri;
use diesel::dsl::count_distinct;
use tauri::api::dialog::blocking::FileDialogBuilder;
use tauri::Manager;
use tauri::State;

#[macro_use]
extern crate diesel;
use self::models::*;
use self::schema::*;
use diesel::insert_into;
use diesel::prelude::*;

use schema::entries::dsl::*;
use schema::people::dsl::*;

#[macro_use]
extern crate diesel_derives;

use diesel::sqlite::SqliteConnection;

use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

struct TARKContext(std::sync::Mutex<Option<diesel::SqliteConnection>>);

#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

fn create_file_diag_builder() -> FileDialogBuilder {
  let mut fd = FileDialogBuilder::new();

  let extensions: Vec<&str> = vec!["tark"];
  fd = fd.add_filter("Tournament ARC Database", &extensions);

  fd // return
}

#[tauri::command(async)]
fn create_db(app_handle: tauri::AppHandle, db: State<TARKContext>) {
  println!("create_db() invoked from JS!");
  match create_file_diag_builder().save_file() {
    Some(path_buf) => {
      let path = path_buf.into_os_string().into_string().unwrap();
      println!("Created file {}.", path);

      let mut connection =
        SqliteConnection::establish(&path).expect(&format!("Error connecting to {}", path));
      connection.run_pending_migrations(MIGRATIONS).unwrap();
      //embedded_migrations::run_with_output(&connection, &mut std::io::stdout()).unwrap();
      *db.0.lock().unwrap() = Some(connection);

      app_handle
        .emit_all(
          "FILE_STATE_CHANGE",
          Payload {
            message: "CREATE".into(),
          },
        )
        .unwrap();
    }
    None => println!("File open operation cancelled."),
  }
}

#[tauri::command(async)]
fn open_db(app_handle: tauri::AppHandle, db: State<TARKContext>) {
  println!("open_db() invoked from JS!");
  match create_file_diag_builder().pick_file() {
    Some(path_buf) => {
      let path = path_buf.into_os_string().into_string().unwrap();
      println!("Opening file {}.", path);
      let mut connection =
        SqliteConnection::establish(&path).expect(&format!("Error connecting to {}", path));
      connection.run_pending_migrations(MIGRATIONS).unwrap();
      //embedded_migrations::run_with_output(&connection, &mut std::io::stdout()).unwrap();
      *db.0.lock().unwrap() = Some(connection);

      app_handle
        .emit_all(
          "FILE_STATE_CHANGE",
          Payload {
            message: "OPEN".into(),
          },
        )
        .unwrap();
    }
    None => println!("File open operation cancelled."),
  }
}

#[tauri::command]
fn close_db(app_handle: tauri::AppHandle, db: State<TARKContext>) {
  app_handle
    .emit_all(
      "FILE_STATE_CHANGE",
      Payload {
        message: "CLOSE".into(),
      },
    )
    .unwrap();
  *db.0.lock().unwrap() = None;
}

#[tauri::command]
fn list_divisions(db_: State<TARKContext>) -> Vec<Division> {
  let mut lock = db_.0.lock().unwrap();
  let db = lock.as_mut();
  let results = divisions::table
    .limit(5)
    .load::<Division>(db.unwrap())
    .expect("Error loading divisions");

  for d in results.iter() {
    println!("{}", d.name);
  }

  results
}

#[derive(Clone, serde::Serialize)]
struct EntryOptions {
  pub divisions: Vec<Division>,
  pub methods: Vec<Method>,
  pub entry_types: Vec<EntryType>,
}

#[tauri::command]
fn list_entry_options(db_: State<TARKContext>) -> EntryOptions {
  let mut lock = db_.0.lock().unwrap();
  let db_opt = lock.as_mut();

  match db_opt {
    Some(db) => {
      println!("Opened the DB.");

      let divisions = divisions::table
        .load::<Division>(db)
        .expect("Error loading divisions");

      let methods = methods::table
        .load::<Method>(db)
        .expect("Error loading methods");

      let entry_types = entry_types::table
        .load::<EntryType>(db)
        .expect("Error loading entry_types");

      EntryOptions {
        divisions: divisions,
        methods: methods,
        entry_types: entry_types,
      }
    }
    None => {
      println!("Failed to open the DB.");
      EntryOptions {
        divisions: vec![],
        methods: vec![],
        entry_types: vec![],
      }
    }
  }
}

// #[derive(Clone, serde::Serialize)]
// struct NewEntryData {
//   pub name: String,
//   pub entry_type: i32,
//   pub division_id: i32,
//   pub method_id: i32,
// }

#[tauri::command]
fn insert_update_entry(
  db_: State<TARKContext>,
  new_entry_identifier: String,
  new_entry_name: String,
  new_entry_type: i32,
  new_division_id: i32,
  new_method_id: i32,
  new_entry_people: Vec<Person>,
) -> Result<(), String> {
  let mut lock = db_.0.lock().unwrap();
  let db_opt = lock.as_mut();

  match db_opt {
    None => {
      dbg!("There is no database connection!");
      Err("There is no database connection!".to_string())
    }
    Some(db) => {
      let ret = db.transaction::<(), diesel::result::Error, _>(|conn| {
        let mut person_id_list: Vec<i32> = vec![];

        for p in new_entry_people.iter() {
          if p.id == 0 {
            let row_count = insert_into(people)
              .values((
                schema::people::name.eq(&p.name),
                schema::people::addr.eq(&p.addr),
                schema::people::phone.eq(&p.phone),
                schema::people::email.eq(&p.email),
                schema::people::attributes.eq(&p.attributes),
              ))
              .execute(conn)?;
            assert!(row_count == 1);

            let d = schema::people::table
              .select(schema::people::id)
              .order(schema::people::id.desc())
              .first::<i32>(conn)?;
            assert!(d != 0);

            person_id_list.push(d);
          } else {
            person_id_list.push(p.id);
          }
        }

        let row_count = insert_into(entries)
          .values((
            schema::entries::identifier.eq(new_entry_identifier),
            schema::entries::name.eq(new_entry_name),
            schema::entries::entry_type.eq(new_entry_type),
            schema::entries::division_id.eq(new_division_id),
            schema::entries::method_id.eq(new_method_id),
          ))
          .execute(conn)?;
        assert!(row_count == 1);
        let entry_id = schema::entries::table
          .select(schema::entries::id)
          .order(schema::entries::id.desc())
          .first::<i32>(conn)?;
        assert!(entry_id != 0);

        for pid in person_id_list {
          let row_count = insert_into(schema::person_to_entries::table)
            .values((
              schema::person_to_entries::person_id.eq(pid),
              schema::person_to_entries::entry_id.eq(entry_id),
            ))
            .execute(conn)?;
          assert!(row_count == 1);
        }

        Ok(())
      });

      match ret {
        Ok(()) => Ok(()),
        Err(e) => {
          let emsg = format!("{}", e);
          println!("insert_update_entry: {}", emsg);
          Err(emsg)
        }
      }
    }
  }
}

#[tauri::command]
fn query_people(
  db_: State<TARKContext>,
  pattern_id: i32,
  pattern_name: String,
  pattern_addr: String,
  pattern_phone: String,
  pattern_email: String,
) -> Vec<models::Person> {
  if pattern_name.eq("") && pattern_addr.eq("") && pattern_phone.eq("") && pattern_email.eq("") {
    println!(
      "Everything is empty string! '{}', '{}', '{}', '{}'",
      pattern_name, pattern_addr, pattern_phone, pattern_email
    );
    return vec![];
  }

  let mut lock = db_.0.lock().unwrap();
  let db = lock.as_mut();

  let mut q = schema::people::table.into_boxed();

  if pattern_id != 0 {
    q = q.filter(schema::people::id.eq(pattern_id));
  }

  if pattern_name.ne("") {
    q = q.filter(schema::people::name.like(pattern_name));
  }

  if pattern_addr.ne("") {
    q = q.filter(schema::people::addr.like(pattern_addr));
  }

  if pattern_phone.ne("") {
    q = q.filter(schema::people::phone.like(pattern_phone));
  }

  if pattern_email.ne("") {
    q = q.filter(schema::people::email.like(pattern_email));
  }

  q.load::<Person>(db.unwrap()).expect("Error loading people")
}

#[derive(Clone, serde::Serialize)]
struct EntryQueryRsult {
  entry: models::Entry,
  entrytype: models::EntryType,
  division: models::Division,
  method: models::Method,
  people: Vec<models::Person>,
}

#[tauri::command]
fn query_entries(
  db_: State<TARKContext>,
  entry_id: i32,
  entry_identifier: String,
  entry_name: String,
  entry_type_id: i32,
  entry_division_id: i32,
  entry_method_id: i32,
  person_id: i32,
) -> Vec<EntryQueryRsult> {
  let mut lock = db_.0.lock().unwrap();
  let db = lock.as_mut().unwrap();

  // use schema::entry_types::dsl::*;
  // use schema::divisions::dsl::*;
  // use diesel::query_dsl::JoinDsl;

  let mut q = schema::entries::table
    .inner_join(schema::entry_types::table)
    .inner_join(schema::divisions::table)
    .inner_join(schema::methods::table)
    .into_boxed();

  if entry_id != 0 {
    q = q.filter(schema::entries::id.eq(entry_id));
  }
  if entry_identifier.ne("") {
    q = q.filter(schema::entries::identifier.eq(entry_identifier));
  }
  if entry_name.ne("") {
    q = q.filter(schema::entries::name.eq(entry_name));
  }
  if entry_type_id != 0 {
    q = q.filter(schema::entries::entry_type.eq(entry_type));
  }
  if entry_division_id != 0 {
    q = q.filter(schema::entries::division_id.eq(entry_division_id));
  }
  if entry_method_id != 0 {
    q = q.filter(schema::entries::method_id.eq(entry_method_id));
  }
  if person_id != 0 {
    use schema::{entries, person_to_entries};
    q = q.filter(
      entries::id.eq_any(
        person_to_entries::table
          .filter(person_to_entries::person_id.eq(person_id))
          .select(person_to_entries::entry_id),
      ),
    );
  }

  use diesel::debug_query;
  use diesel::sqlite::Sqlite;
  let debug = debug_query::<Sqlite, _>(&q).to_string();
  println!("query_entries: '''{}'''", debug);

  let a = q
    .load::<(
      models::Entry,
      models::EntryType,
      models::Division,
      models::Method,
    )>(db)
    .expect("Error loading people");

  let mut result: Vec<EntryQueryRsult> = vec![];

  for full_entry in a.iter() {
    let mut new_item = EntryQueryRsult {
      entry: full_entry.0.clone(),
      entrytype: full_entry.1.clone(),
      division: full_entry.2.clone(),
      method: full_entry.3.clone(),
      people: vec![],
    };

    let people_res = schema::people::table
      .inner_join(schema::person_to_entries::table)
      .filter(schema::person_to_entries::entry_id.eq(full_entry.0.id))
      .load::<(Person, PersonToEntry)>(db)
      .expect("Error loading people");

    for p in people_res.iter() {
      new_item.people.push(p.0.clone())
    }

    result.push(new_item);
  }

  result
}


#[derive(Clone, serde::Serialize)]
struct EntryTypeStatistics {
  count: i64,
  division_id: i64,
  division: String,
  entry_type: i64,
  class: String,
  technique: String,
  method_id: i64,
  method: String,
}

#[derive(Clone, serde::Serialize)]
struct StatisticsQueryResult {
  entry_count: i64,
  entrant_count: i64,
  entry_type_stats: Vec<EntryTypeStatistics>,
}

#[tauri::command]
fn query_statistics(
  db_: State<TARKContext>,
) -> Result<StatisticsQueryResult, ()> {
  let mut lock = db_.0.lock().unwrap();
  let db_opt = lock.as_mut();

  match db_opt {
    Some(db) => {
      println!("Opened the DB.");

      let total_entries: i64 = schema::entries::table
              .count()
              .get_result(db)
              .expect("Error loading total entry count");

      let total_participants: i64 = schema::people::table
              .inner_join(schema::person_to_entries::table)
              .select(count_distinct(schema::people::id))
              .get_result(db)
              .expect("Error loading total participant count");

      //const group_stats: Vec<EntryTypeStatistics> =
        //count: i64,
        //division_id: i64,
        //division: String,
        //entry_type: i64,
        //class: String,
        //technique: String,
        //method_id: i64,
        //method: String, 
      // schema::entries::table
      //   .inner_join(schema::person_to_entries::table)
      //   .inner_join(schema::entry_types::table)
      //   .inner_join(schema::divisions::table)
      //   .inner_join(schema::methods::table)
      //   .group_by((
      //     schema::entry_types::id,
      //     schema::divisions::id,
      //     schema::methods::id,
      //   ))
      //         .select((
      //           count_distinct(schema::people::id),
      //           schema::divisions::id, //schema::divisions::name,
      //           schema::entry_types::id, //schema::entry_types::first, schema::entry_types::second,
      //           schema::methods::id, //schema::methods::name,
      //         ))
      //         .get_result(db)
      //         .expect("Error loading entry statistics");

      Ok(StatisticsQueryResult {
        entry_count: total_entries,
        entrant_count: total_participants,
        entry_type_stats: vec![],
      })
    }
    None => {
      println!("Failed to open the DB.");
      Err(())
    }
  }
}

fn main() {
  tauri::Builder::default()
    .manage(TARKContext(Default::default()))
    .invoke_handler(tauri::generate_handler![
      close_db,
      create_db,
      open_db,
      list_divisions,
      list_entry_options,
      insert_update_entry,
      query_people,
      query_entries,
      query_statistics,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
