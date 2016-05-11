var _ = require('lodash');

exports.spaceify = function(string){
  return string.replace(/-/gi, ' ');
};
