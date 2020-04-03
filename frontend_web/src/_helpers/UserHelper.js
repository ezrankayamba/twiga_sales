export const UserHelper = {
  privs(user) {
    return user && user.profile && user.profile && user.profile.role
      ? user.profile.role.privileges
      : [];
  },
  hasPriv(user, priv) {
    let list = this.privs(user);
    let prv = list.find(p => p === priv);
    return prv ? true : false;
  }
};
