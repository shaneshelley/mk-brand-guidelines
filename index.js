var express = require('express'),
    util    = require('./utils/util'),
    path    = require('path'),
    mime    = require('mime'),
    fs      = require('fs');

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/app');
app.set('view engine', 'jade');
app.set('view cache', false);

app.locals.basedir = app.get('views');

app.get('/brand-guidelines', function(request, response){
  response.render('modules/brand-guidelines/views');
});

app.get('/', function(request, response){
  response.redirect('brand-guidelines');
});

// start the app
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
