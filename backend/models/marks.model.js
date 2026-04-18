const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentDetails",
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  marksObtained: {
    type: Number,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  isSubmitted: { type: Boolean, default: false },
  submittedAt: { type: Date },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "FacultyDetail" },
  editHistory: [
    {
      previousMarks: Number,
      updatedMarks: Number,
      editedAt: { type: Date, default: Date.now },
      editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "FacultyDetail" },
    },
  ],
});

module.exports = mongoose.model("Marks", marksSchema);
