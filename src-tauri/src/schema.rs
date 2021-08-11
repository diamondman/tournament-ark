use diesel::table;

table! {
    divisions (id) {
        id -> Integer,
        abbr -> Text,
        name -> Text,
  }
}

table! {
    methods (id) {
        id -> Integer,
        abbr-> Text,
        name-> Text,
    }
}

table! {
    entry_types (id) {
        id -> Integer,
        first -> Text,
        second -> Text,
    }
}

table! {
    entries (id) {
        id -> Integer,
        identifier -> Text,
        name -> Text,
        entry_type -> Integer,
        division_id -> Integer,
        method_id -> Integer,
    }
}

table! {
    people (id) {
        id ->  Integer,
        name -> Text,
        addr -> Text,
        phone -> Text,
        email -> Text,
        attributes -> Text,
    }
}

table! {
    person_to_entries (person_id, entry_id) {
        person_id -> Integer,
        entry_id -> Integer,
    }
}


joinable!(entries -> entry_types (entry_type));
allow_tables_to_appear_in_same_query!(entries, entry_types);

joinable!(entries -> divisions (division_id));
allow_tables_to_appear_in_same_query!(entries, divisions);

joinable!(entries -> methods (method_id));
allow_tables_to_appear_in_same_query!(entries, methods);

joinable!(person_to_entries -> people (person_id));
allow_tables_to_appear_in_same_query!(people, person_to_entries);


allow_tables_to_appear_in_same_query!(entry_types, divisions);
allow_tables_to_appear_in_same_query!(entry_types, methods);
allow_tables_to_appear_in_same_query!(divisions, methods);


allow_tables_to_appear_in_same_query!(person_to_entries, entries);
allow_tables_to_appear_in_same_query!(person_to_entries, entry_types);
allow_tables_to_appear_in_same_query!(person_to_entries, divisions);
allow_tables_to_appear_in_same_query!(person_to_entries, methods);