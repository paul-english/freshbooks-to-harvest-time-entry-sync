var FreshBooks = require("freshbooks");
var Harvest = require("harvest");
var moment = require("moment");
var fs = require("fs");

var config = require('config')
  , freshbooks = new FreshBooks(config.freshbooks.url, config.freshbooks.token)
  , time_entry = new freshbooks.Time_Entry()
  , harvest = new Harvest({
      subdomain: config.harvest.subdomain,
      email: config.harvest.email,
      password: config.harvest.password
  })
  , TimeTracking = harvest.TimeTracking
  ;

var latest_entry_date = null;
try {
    latest_entry_date = fs.readFileSync('last_run_entry_date.txt', 'UTF8');
} catch(e) {
    latest_entry_date = "1900-01-01";
}

latest_entry_date = moment(latest_entry_date).add('days', 1).format('YYYY-MM-DD');

console.log('date_from', latest_entry_date);

var options = {
  date_from: latest_entry_date,
  project_id: config.freshbooks.project.id
};

time_entry.list(options, function(err, time_entries) {
  if (err) return console.log('error getting freshbooks entries:', err);

  console.log('syncing', time_entries.length, (time_entries.length == 1) ? 'entry' : 'entries');

  time_entries.forEach(function(time_entry) {

    console.log(time_entry.date, "(" + time_entry.hours + " hours):", time_entry.notes);

    var harvest_time_entry = {
	notes: time_entry.notes,
	hours: time_entry.hours,
	project_id: config.harvest.project.id,
	task_id: config.harvest.task.id,
	spent_at: moment(time_entry.date).format('ddd, DD MMM YYYY')
    };

    if (new Date(time_entry.date) > new Date(latest_entry_date)) {
	latest_entry_date = time_entry.date;
    }

    TimeTracking.create(harvest_time_entry, function(err, timer) {
	if (err) console.log('error creating harvest entry', err);
	console.log('✓');
    });

  });

  if (time_entries.length > 0) {

      // Store latest entry date
      fs.writeFile('last_run_entry_date.txt', latest_entry_date, function(err) {
	  if (err) console.log('error writing latest entry date:', err);
	  console.log('saved latest run');
      });

  } else {

      console.log('no entries to save, exiting');

  }

});
