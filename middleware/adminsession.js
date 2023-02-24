module.exports = {
  isLogged: (req, res, next) => {
    if (req.session.admin) {
      next()
    } else {
      res.redirect('/admin')
    }
  },
  notLogged: (req, res, next) => {
    if (!req.session.admin) {
      next()
    } else {
      res.redirect('/admin/adminlogin')
    }
  }
}
