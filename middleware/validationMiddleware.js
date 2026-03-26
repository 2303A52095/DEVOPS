const sanitizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const ensureFields = (fields) => (req, res, next) => {
  const missingFields = fields.filter((field) => !sanitizeText(req.body[field]));

  if (missingFields.length > 0) {
    req.flash('error', `${missingFields.join(', ')} ${missingFields.length > 1 ? 'are' : 'is'} required.`);
    return res.redirect('back');
  }

  next();
};

module.exports = { ensureFields, sanitizeText };
