const AcademicRecord = require('../models/AcademicRecord');

// Get all academic records
exports.getAcademicRecords = async (req, res) => {
  try {
    const records = await AcademicRecord.find({ firebaseId: req.user.id });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get academic records by term
exports.getAcademicRecordsByTerm = async (req, res) => {
  try {
    const term = req.params.term;
    
    const records = await AcademicRecord.find({ 
      term,
      firebaseId: req.user.id
    });
    
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add a new academic record
exports.addAcademicRecord = async (req, res) => {
  try {
    const { name, term, credits, grade, gradePercentage, letterGrade, notes } = req.body;
    
    const record = new AcademicRecord({
      name,
      term,
      credits,
      grade,
      gradePercentage,
      letterGrade,
      notes,
      firebaseId: req.user.id
    });
    
    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update an academic record
exports.updateAcademicRecord = async (req, res) => {
  try {
    const { name, term, credits, grade, gradePercentage, letterGrade, notes } = req.body;
    
    // Find record and check if it exists
    let record = await AcademicRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: 'Academic record not found' });
    }
    
    // Check if the record belongs to the user
    if (record.firebaseId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update fields
    const updatedRecord = await AcademicRecord.findByIdAndUpdate(
      req.params.id,
      {
        name,
        term,
        credits,
        grade,
        gradePercentage,
        letterGrade,
        notes
      },
      { new: true }
    );
    
    res.json(updatedRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete an academic record
exports.deleteAcademicRecord = async (req, res) => {
  try {
    // Find record and check if it exists
    let record = await AcademicRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: 'Academic record not found' });
    }
    
    // Check if the record belongs to the user
    if (record.firebaseId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await AcademicRecord.findByIdAndRemove(req.params.id);
    
    res.json({ message: 'Academic record removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
