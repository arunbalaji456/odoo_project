export function signup(name, email, password) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");

  if (users.find((u) => u.email === email)) {
    throw new Error("An account with this email already exists");
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    role: "employee",
    department: null,
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(newUser));
  return newUser;
}

export function login(email, password) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  return user;
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser") || "null");
}

export function logout() {
  localStorage.removeItem("currentUser");
}