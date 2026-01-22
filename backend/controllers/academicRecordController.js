import AcademicRecord, { find, findById, findByIdAndUpdate, findByIdAndRemove } from '../models/AcademicRecord';

// Get all academic records
export async function getAcademicRecords(req, res) {
  try {
    const records = await find({ firebaseId: req.user.id });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Get academic records by term
export async function getAcademicRecordsByTerm(req, res) {
  try {
    const term = req.params.term;
    
    const records = await find({ 
      term,
      firebaseId: req.user.id
    });
    
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Add a new academic record
export async function addAcademicRecord(req, res) {
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
}

// Update an academic record
export async function updateAcademicRecord(req, res) {
  try {
    const { name, term, credits, grade, gradePercentage, letterGrade, notes } = req.body;
    
    // Find record and check if it exists
    let record = await findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: 'Academic record not found' });
    }
    
    // Check if the record belongs to the user
    if (record.firebaseId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update fields
    const updatedRecord = await findByIdAndUpdate(
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
}

// Delete an academic record
export async function deleteAcademicRecord(req, res) {
  try {
    // Find record and check if it exists
    let record = await findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: 'Academic record not found' });
    }
    
    // Check if the record belongs to the user
    if (record.firebaseId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await findByIdAndRemove(req.params.id);
    
    res.json({ message: 'Academic record removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}
