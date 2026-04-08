const mongoose = require('mongoose');
const Loan = require('../schemas/Loan');
const LoanDetail = require('../schemas/LoanDetail');
const Book = require('../schemas/Book');
const User = require('../schemas/User');
const { createAndSendNotification } = require('./notificationController');

const borrowBook = async (req) => {
  const { user_id, due_date, books } = req.body;
  const isAdmin = req.user?.role_id?.name === 'admin';
  const effectiveUserId = isAdmin && user_id ? user_id : req.user?._id;

  if (!effectiveUserId) {
    throw new Error('Authenticated user not found.');
  }

  if (!due_date) {
    throw new Error('due_date is required.');
  }

  if (!Array.isArray(books) || books.length === 0) {
    throw new Error('books must be a non-empty array.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(effectiveUserId).session(session);
    if (!user) {
      throw new Error('User not found.');
    }

    const newLoan = await Loan.create([{
      user_id: effectiveUserId,
      due_date
    }], { session });

    const loan_id = newLoan[0]._id;

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

    await createAndSendNotification(
      effectiveUserId,
      `Mượn sách thành công! Hạn trả là: ${new Date(due_date).toLocaleDateString()}.`,
      'Hệ thống'
    );

    return {
      success: true,
      message: 'Loan successfully created.',
      data: newLoan[0]
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  borrowBook
};
