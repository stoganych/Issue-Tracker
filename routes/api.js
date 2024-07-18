'use strict';
const express = require('express');
const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.connect(process.env.MONGO_URI);
const bodyParser = require('body-parser');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const IssueSchema = new Schema({
  project: String,
  assigned_to: String,
  status_text: String,
  open: { type: Boolean, default: true },
  issue_title: String,
  issue_text: String,
  created_by: String,

},{ timestamps: true });

const IssueModel = mongoose.model("Issue", IssueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async function (req, res) {
      req.query.project = req.params.project;
      const issues = await IssueModel.find({ ...req.query });
    
      if (issues.length === 0) {
       return res.send([{}]);
      }
      const resp = issues.map((d) => ({
        _id: d._id,
        issue_title: d.issue_title,
        issue_text: d.issue_text,
        created_on: d.createdAt,
        updated_on: d.updatedAt,
        created_by: d.created_by,
        assigned_to: d.assigned_to || "",
        open: d.open,
        status_text: d.status_text || ""
      }));

      return res.json(resp);
    })



    .post(async function (req, res) {
      
      req.body.project = req.params.project;
 
      const {
        body: { issue_title, issue_text, created_by }
      } = req;

      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }

      const issue = await IssueModel.create(req.body);
      var resp = {
        _id: issue._id,
        issue_title: issue.issue_title,
        issue_text: issue.issue_text,
        created_on: issue.createdAt,
        updated_on: issue.updatedAt,
        created_by: issue.created_by,
        assigned_to: issue.assigned_to || "",
        open: issue.open,
        status_text: issue.status_text || ""
      };

      return res.json(resp);
    })

    .put(async function (req, res) {
      const {
        body: {
          _id: id,
          issue_title: i_ti,
          issue_text: i_te,
          created_by: c_by,
          assigned_to: a_to,
          status_text: s_te,
          open: o
        }
      } = req;

      const body = {
        _id: id,
        issue_title: i_ti,
        issue_text: i_te,
        created_by: c_by,
        assigned_to: a_to,
        status_text: s_te,
        open: o
      };

      if (!id) {
        res.json({ error: "missing _id" });
        return;
      }

      if (!i_ti && !i_te && !c_by && !a_to && !s_te && !o) {
        res.json({ error: "no update field(s) sent", _id: id });
        return;
      }

      var cleanBody = Object.keys(body)
        .filter((k) => body[k] !== "")
        .reduce((a, k) => ({ ...a, [k]: body[k] }), {});

      const issue = await IssueModel.findByIdAndUpdate(
        { _id: req.body._id },
        { $set: cleanBody },
        { new: true, runValidators: true }
      );

      if (!issue) {
        res.json({ error: "could not update", _id: id });
        return;
      }

      res.json({ result: "successfully updated", _id: id });
    })

    .delete(async function (req, res) {
      const id = req.body._id;

      if (!id) {
        res.json({ error: "missing _id" });
        return;
      }

      const issue = await IssueModel.findOneAndDelete({ _id: id });

      if (!issue) {
        res.json({ error: "could not delete", _id: id });
        return;
      }
      res.json({ result: "successfully deleted", _id: id });

      // const _id = req.body._id;
      // if (_id === '' || _id == null) {
      //   return res.send({ error: 'missing _id' });
      // }
      // IssueModel.findByIdAndDelete({ _id }).then(() => {
      //   res.send({ result: 'successfully deleted', '_id': _id })
      // }).catch(() => res.send({ error: 'could not delete', '_id': _id }))
    });

};
