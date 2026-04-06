const Loan = require('../schemas/Loan');
const LoanDetail = require('../schemas/LoanDetail');
const Book = require('../schemas/Book');
const Fine = require('../schemas/Fine');
const { createAndSendNotification } = require('./notificationController');

const FINE_PER_DAY = 5000;

async function returnBook(payload, currentUser) {
  const { loan_id, book_id, condition } = payload;
  const isAdmin = currentUser?.role_id?.name === 'admin';

  if (!loan_id || !book_id) {
    return {
      success: false,
      statusCode: 400,
      message: 'loan_id va book_id la bat buoc'
    };
  }

  const loan = await Loan.findById(loan_id);
  if (!loan) {
    return {
      success: false,
      statusCode: 404,
      message: 'Khong tim thay phieu muon'
    };
  }

  if (!isAdmin && String(loan.user_id) !== String(currentUser?._id)) {
    return {
      success: false,
      statusCode: 403,
      message: 'Ban khong co quyen tra phieu muon nay'
    };
  }

  const loanDetail = await LoanDetail.findOne({ loan_id, book_id });
  if (!loanDetail) {
    return {
      success: false,
      statusCode: 404,
      message: 'Khong tim thay chi tiet muon sach'
    };
  }

  if (loanDetail.return_date) {
    return {
      success: false,
      statusCode: 400,
      message: 'Sach nay da duoc tra truoc do'
    };
  }

  loanDetail.return_date = new Date();
  if (condition) {
    loanDetail.condition = condition;
  }
  await loanDetail.save();

  await Book.findByIdAndUpdate(book_id, { $inc: { available_copies: 1 } });

  const now = new Date();
  const dueDate = new Date(loan.due_date);
  let createdFine = null;

  if (now > dueDate) {
    const lateDays = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const existedLateFine = await Fine.findOne({
      loan_id,
      reason: { $regex: /^Tre han/i }
    });

    if (!existedLateFine) {
      createdFine = await Fine.create({
        loan_id,
        amount: lateDays * FINE_PER_DAY,
        reason: `Tre han ${lateDays} ngay`,
        is_paid: false
      });
      createdFine.isNewlyCreated = true;
    } else {
      createdFine = existedLateFine;
    }
  }

  const loanDetails = await LoanDetail.find({ loan_id });
  const allReturned = loanDetails.every((item) => item.return_date);
  const statusValues = Loan.schema.path('status').enumValues;

  if (allReturned) {
    loan.status = statusValues[1];
  } else if (now > dueDate) {
    loan.status = statusValues[2];
  }
  await loan.save();

  await createAndSendNotification(
    loan.user_id,
    `Tráº£ sÃ¡ch thÃ nh cÃ´ng cuá»‘n ID: ${book_id}.`,
    'Há»‡ thá»‘ng'
  );

  if (createdFine && createdFine.isNewlyCreated) {
    await createAndSendNotification(
      loan.user_id,
      `Báº¡n cÃ³ khoáº£n pháº¡t má»›i: ${createdFine.amount}Ä‘ cho lÃ½ do: ${createdFine.reason}.`,
      'Nháº¯c tráº£ sÃ¡ch'
    );
  }

  return {
    success: true,
    statusCode: 200,
    message: 'Tra sach thanh cong',
    data: {
      loan_detail: loanDetail,
      fine: createdFine
    }
  };
}

async function getLoans(currentUser, options = {}) {
  const isAdmin = currentUser?.role_id?.name === 'admin';
  const query = {};

  if (!isAdmin || options.onlyCurrentUser) {
    query.user_id = currentUser?._id;
  }

  const loans = await Loan.find(query)
    .populate('user_id', 'username full_name email')
    .sort({ loan_date: -1 })
    .lean();

  const loanIds = loans.map((loan) => loan._id);
  const details = await LoanDetail.find({ loan_id: { $in: loanIds } })
    .populate('book_id', 'title isbn cover_url')
    .lean();

  const detailMap = details.reduce((acc, detail) => {
    const key = String(detail.loan_id);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(detail);
    return acc;
  }, {});

  return loans.map((loan) => ({
    ...loan,
    details: detailMap[String(loan._id)] || []
  }));
}

module.exports = {
  returnBook,
  getLoans
};
