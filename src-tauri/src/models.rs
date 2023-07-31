//use diesel::Queryable;

use super::schema::*;

#[derive(Identifiable, Queryable, Clone, serde::Serialize)]
pub struct Division {
  pub id: i32,
  pub abbr: String,
  pub name: String,
}

#[derive(Identifiable, Queryable, Clone, serde::Serialize)]
pub struct Method {
  pub id: i32,
  pub abbr: String,
  pub name: String,
}

#[derive(Identifiable, Queryable, Clone, serde::Serialize)]
pub struct EntryType {
  pub id: i32,
  pub first: String,
  pub second: String,
}

#[derive(Identifiable, Queryable, Associations, Clone, serde::Serialize)]
#[diesel(belongs_to(EntryType, foreign_key = entry_type))]
#[diesel(belongs_to(Division, foreign_key = division_id))]
#[diesel(belongs_to(Method, foreign_key = method_id))]
#[diesel(table_name = entries)]
pub struct Entry {
  pub id: i32,
  pub identifier: String,
  pub name: String,
  pub entry_type: i32,
  pub division_id: i32,
  pub method_id: i32,
}

#[derive(Identifiable, Queryable, Debug, Clone, serde::Serialize, serde::Deserialize)]
#[diesel(table_name = people)]
pub struct Person {
  pub id: i32,
  pub name: String,
  pub addr: String,
  pub phone: String,
  pub email: String,
  pub attributes: String,
}

#[derive(Identifiable, Queryable, Associations, Clone, serde::Serialize)]
#[diesel(primary_key(person_id, entry_id))]
#[diesel(belongs_to(Person, foreign_key = person_id))]
#[diesel(belongs_to(Entry, foreign_key = entry_id))]
#[diesel(table_name = person_to_entries)]
pub struct PersonToEntry {
  pub person_id: i32,
  pub entry_id: i32,
}
