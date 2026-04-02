const mongoose = require('mongoose');
const Loan = require('../schemas/Loan');
const LoanDetail = require('../schemas/LoanDetail');
const Book = require('../schemas/Book');

const borrowBook = async (req, res) => {
    const { user_id, due_date, books } = req.body; 
    // books is an array of objects like { book_id: "id", condition: "abc" }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 0. Check User existence
        const User = require('../schemas/User');
        const user = await User.findById(user_id).session(session);
        if (!user) {
            throw new Error('User not found.');
        }

        // 1. Create a Loan Record
        const newLoan = await Loan.create([{
            user_id,
            due_date,
            status: 'Đang mượn'
        }], { session });

        const loan_id = newLoan[0]._id;

        // 2. Prepare Loan Details and Update Books quantity
        for (const item of books) {
            // Find book and check availability
            const book = await Book.findById(item.book_id).session(session);
            if (!book) {
                throw new Error(`Book with ID ${item.book_id} not found.`);
            }
            if (book.available_copies <= 0) {
                throw new Error(`Book "${book.title}" is out of stock.`);
            }

            // Decrement quantity
            book.available_copies -= 1;
            await book.save({ session });

            // Create LoanDetail
            await LoanDetail.create([{
                loan_id,
                book_id: item.book_id,
                condition: item.condition || 'New'
            }], { session });
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: 'Loan successfully created.',
            data: newLoan[0]
        });

    } catch (error) {
        // Abort transaction on error
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    borrowBook
};
