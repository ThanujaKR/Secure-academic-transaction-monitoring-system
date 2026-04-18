const Marks = require("../models/marks.model");
const Student = require("../models/details/student-details.model");

const getMarksController = async (req, res) => {
  try {
    const { studentId, semester, examId } = req.query;

    const query = { student: studentId };
    if (semester) {
      query.semester = semester;
    }

    if (examId) {
      query.examId = examId;
    }

    const marks = await Marks.find(query)
      .populate("branch", "name")
      .populate("marks.subject", "name")
      .populate("student", "firstName lastName enrollmentNo");

    if (!marks || marks.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No marks found for the specified criteria",
      });
    }

    res.json({
      success: true,
      message: "Marks retrieved successfully",
      data: marks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const addMarksController = async (req, res) => {
  try {
    const { studentId, semester, branch, marks } = req.body;

    if (!studentId || !semester || !branch || !marks || !Array.isArray(marks)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    let existingMarks = await Marks.findOne({ student: studentId, semester });

    if (existingMarks) {
      existingMarks.marks = marks;
      await existingMarks.save();
    } else {
      existingMarks = await Marks.create({
        student: studentId,
        semester,
        branch,
        marks,
      });
    }

    res.json({
      success: true,
      message: "Marks updated successfully",
      data: existingMarks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteMarksController = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMarks = await Marks.findByIdAndDelete(id);

    if (!deletedMarks) {
      return res.status(404).json({
        success: false,
        message: "Marks not found",
      });
    }

    res.json({
      success: true,
      message: "Marks deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const addBulkMarksController = async (req, res) => {
  try {
    const { marks, examId, subjectId, semester } = req.body;

    if (!marks || !Array.isArray(marks) || !examId || !subjectId || !semester) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid input data. Required: marks array, examId, subjectId, and semester",
      });
    }

    const results = [];
    for (const markData of marks) {
      const existingMark = await Marks.findOne({
        studentId: markData.studentId,
        examId,
        subjectId,
        semester,
      });

      if (existingMark) {
        existingMark.editHistory.push({
          previousMarks: existingMark.marksObtained,
          updatedMarks: markData.obtainedMarks,
          editedBy: req.userId,
        });
        existingMark.marksObtained = markData.obtainedMarks;
        existingMark.submittedAt = new Date();
        existingMark.submittedBy = req.userId;
        await existingMark.save();
        results.push(existingMark);
      } else {
        const newMark = await Marks.create({
          studentId: markData.studentId,
          examId,
          subjectId,
          semester,
          marksObtained: markData.obtainedMarks,
          isSubmitted: true,
          submittedAt: new Date(),
          submittedBy: req.userId,
        });
        results.push(newMark);
      }
    }

    res.json({
      success: true,
      message: "Marks submitted successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error in addBulkMarksController:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error submitting marks",
    });
  }
};

const getStudentsWithMarksController = async (req, res) => {
  try {
    const { branch, subject, semester, examId } = req.query;

    if (!branch || !subject || !semester || !examId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: branch, subject, semester, and examId are required",
      });
    }

    const students = await Student.find({
      branchId: branch,
      semester: Number(semester),
    }).select("_id enrollmentNo firstName lastName");

    if (!students || students.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No students found for the specified criteria",
      });
    }

    const marks = await Marks.find({
      studentId: { $in: students.map((s) => s._id) },
      examId,
      subjectId: subject,
      semester: Number(semester),
    }).populate("submittedBy", "firstName lastName")
      .populate("editHistory.editedBy", "firstName lastName");

    const studentsWithMarks = students.map((student) => {
      const studentMarks = marks.find(
        (m) => m.studentId.toString() === student._id.toString()
      );
      return {
        ...student.toObject(),
        obtainedMarks: studentMarks ? studentMarks.marksObtained : 0,
        isSubmitted: studentMarks ? studentMarks.isSubmitted : false,
        submittedAt: studentMarks ? studentMarks.submittedAt : null,
        submittedBy: studentMarks ? studentMarks.submittedBy : null,
        lastUpdatedBy: studentMarks?.editHistory?.length
          ? studentMarks.editHistory[studentMarks.editHistory.length - 1].editedBy
          : null,
        marksId: studentMarks ? studentMarks._id : null,
      };
    });

    res.json({
      success: true,
      message: "Students retrieved successfully with marks",
      data: studentsWithMarks,
    });
  } catch (error) {
    console.error("Error in getStudentsWithMarksController:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving students with marks",
    });
  }
};

const getStudentMarksController = async (req, res) => {
  try {
    const { semester } = req.query;
    const studentId = req.userId;

    if (!semester) {
      return res.status(400).json({
        success: false,
        message: "Semester is required",
      });
    }

    const marks = await Marks.find({
      studentId,
      semester: Number(semester),
    })
      .populate("subjectId", "name")
      .populate("examId", "name examType totalMarks")
      .populate("submittedBy", "firstName lastName");

    if (!marks || marks.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No marks found for this semester",
      });
    }

    res.json({
      success: true,
      message: "Marks retrieved successfully",
      data: marks,
    });
  } catch (error) {
    console.error("Error in getStudentMarksController:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving marks",
    });
  }
};

const getMarksHistoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const mark = await Marks.findById(id).populate(
      "editHistory.editedBy",
      "firstName lastName"
    );
    if (!mark) {
      return res.status(404).json({ success: false, message: "Mark not found" });
    }
    res.json({ success: true, data: mark.editHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getMarksController,
  addMarksController,
  deleteMarksController,
  addBulkMarksController,
  getStudentsWithMarksController,
  getStudentMarksController,
  getMarksHistoryController,
};
