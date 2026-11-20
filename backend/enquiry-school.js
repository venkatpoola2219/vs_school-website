const db = require('./db');

// Enquiries opened from a school page are saved with that school's name.
// This adds the school_name column to admission_enquiries the first time it is
// needed, so no manual SQL is required. If the database user is not allowed to
// ALTER the table, hasSchoolColumn() returns false and the school name is saved
// at the start of the message instead.
let check = null;

function hasSchoolColumn() {
  if (!check) {
    check = (async () => {
      try {
        const [columns] = await db.execute("SHOW COLUMNS FROM admission_enquiries LIKE 'school_name'");
        if (columns.length) return true;
        await db.execute('ALTER TABLE admission_enquiries ADD COLUMN school_name VARCHAR(255) NULL');
        return true;
      } catch (error) {
        console.error('Could not add school_name to admission_enquiries:', error.message);
        check = null; // try again next time
        return false;
      }
    })();
  }
  return check;
}

module.exports = { hasSchoolColumn };
