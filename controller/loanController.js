const mongoose = require('mongoose');
const Loan = require('../schemas/Loan');
const LoanDetail = require('../schemas/LoanDetail');
const Book = require('../schemas/Book');
const User = require('../schemas/User');

const borrowBook = async (req) => {
    const { user_id, due_date, books } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 0. Check User
        const user = await User.findById(user_id).session(session);
        if (!user) {
            throw new Error('User not found.');
        }

        // 1. Create Loan
        const newLoan = await Loan.create([{
            user_id,
            due_date,
            status: 'Đang mượn'
        }], { session });

        const loan_id = newLoan[0]._id;

        // 2. Loop books
        for (const item of books) {
            const book = await Book.findById(item.book_id).session(session);

            if (!book) {
                throw new Error(`Book with ID ${item.book_id} not found.`);
            }

            if (book.available_copies <= 0) {
                throw new Error(`Book "${book.title}" is out of stock.`);
            }

            book.available_copies -= 1;
            await book.save({ session });

            await LoanDetail.create([{
                loan_id,
                book_id: item.book_id,
                condition: item.condition || 'New'
            }], { session });
        }

        await session.commitTransaction();
        session.endSession();

        // ✅ chỉ return data
        return {
            success: true,
            message: 'Loan successfully created.',
            data: newLoan[0]
        };

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        // ❗ throw cho router bắt
        throw error;
    }
};

module.exports = {
    borrowBook
};