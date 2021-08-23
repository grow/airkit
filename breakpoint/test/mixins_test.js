var chai = require('chai');
var chaiFs = require('chai-fs');
var path = require('path');
var sass = require('dart-sass');

chai.use(chaiFs);
var assert = chai.assert;
var should = chai.should();

var Path = {
  INPUT: path.join(__dirname, 'testdata/a.scss'),
  EXPECTED_OUTPUT: path.join(__dirname, 'testdata/a.min.css')
};

describe('ak-breakpoint', function() {
  it('a.scss should compile to a.min.css', function(done) {
    sass.render({
      file: Path.INPUT,
      outputStyle: 'expanded'
    }, function(err, result) {
      should.not.exist(err);
      assert.fileContent(Path.EXPECTED_OUTPUT, result.css.toString());
      done();
    });
  });
});
