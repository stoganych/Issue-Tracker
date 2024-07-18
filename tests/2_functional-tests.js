const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Every field filled in',
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.body.issue_title, 'Title')
            assert.equal(res.body.issue_text, 'text')
            assert.equal(res.body.created_by, 'Functional Test - Every field filled in')
            assert.equal(res.body.assigned_to, 'Chai and Mocha')
            assert.equal(res.body.status_text, 'In QA')
            assert.equal(res.body.open, true)
            assert.property(res.body, 'created_on')
            assert.property(res.body, 'updated_on')
            assert.property(res.body, '_id')
            _idTest = res.body._id

            done()
          })
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.issue_title, 'Title')
          assert.equal(res.body.issue_text, 'text')
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in')
          assert.equal(res.body.assigned_to, '')
          assert.equal(res.body.status_text, '')
          assert.equal(res.body.open, true)
          assert.property(res.body, 'created_on')
          assert.property(res.body, 'updated_on')
          assert.property(res.body, '_id')

          done()
        });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, '{"error":"required field(s) missing"}')

            done()
          })
      })
      
    })
    
    suite('PUT /api/issues/{project} => text', function() {

      test('Missing id', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            status_text: 'updated'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, `{"error":"missing _id"}`)
          
            done()
          })
      })
      
      test('Invalid id', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: "6542bcb70680d11cd05fb050",
            status_text: 'updated'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, `{"error":"could not update","_id":"6542bcb70680d11cd05fb050"}`)
          
            done()
          })
      })
      

      test('No body', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: _idTest
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, `{"error":"no update field(s) sent","_id":"${_idTest}"}`)

            done()
          })
      })
      
      test('One field to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: _idTest,
            status_text: 'updated'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, `{"result":"successfully updated","_id":"${_idTest}"}`)
          
            done()
          })
      })
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: _idTest,
            status_text: 'updated again',
            assigned_to: 'Someone else'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, `{"result":"successfully updated","_id":"${_idTest}"}`)
          
            done()
          })
      })
      
    })
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({})
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            assert.property(res.body[0], 'issue_title')
            assert.property(res.body[0], 'issue_text')
            assert.property(res.body[0], 'created_on')
            assert.property(res.body[0], 'updated_on')
            assert.property(res.body[0], 'created_by')
            assert.property(res.body[0], 'assigned_to')
            assert.property(res.body[0], 'open')
            assert.property(res.body[0], 'status_text')
            assert.property(res.body[0], '_id')
          
            done()
          })
      })
      
      test('One filter', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({
            assigned_to: 'Someone else'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            assert.property(res.body[0], 'issue_title')
            assert.equal(res.body[0].issue_title, 'Title')
            assert.property(res.body[0], 'issue_text')
            assert.property(res.body[0], 'created_on')
            assert.property(res.body[0], 'updated_on')
            assert.property(res.body[0], 'created_by')
            assert.property(res.body[0], 'assigned_to')
            assert.property(res.body[0], 'open')
            assert.property(res.body[0], 'status_text')
            assert.property(res.body[0], '_id')
          
            done()
          })
      })
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({
            issue_title: 'Title',
            issue_text: 'text',
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            assert.property(res.body[0], 'issue_title')
            assert.equal(res.body[0].issue_title, 'Title')
            assert.property(res.body[0], 'issue_text')
            assert.equal(res.body[0].issue_text, 'text')
            assert.property(res.body[0], 'created_on')
            assert.property(res.body[0], 'updated_on')
            assert.property(res.body[0], 'created_by')
            assert.property(res.body[0], 'assigned_to')
            assert.property(res.body[0], 'open')
            assert.property(res.body[0], 'status_text')
            assert.property(res.body[0], '_id')
          
            done()
          })
      })
      
    })
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, '{"error":"missing _id"}')
          
            done()
          })
      })
      
      test('Valid _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({ _id: _idTest })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, `{"result":"successfully deleted","_id":"${_idTest}"}`)
            
            done()
          })
      })

      test('Invalid _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({ _id: _idTest })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, `{"error":"could not delete","_id":"${_idTest}"}`)
            
            done()
          })
      })
      
    })

})
