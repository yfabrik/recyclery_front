import { useState } from "react";
import { type UserModel } from "../interfaces/Models";
import { fetchUsers, getUsersWithStore } from "./api/users";

export const useUser = () => {
  const [users, setUsers] = useState<UserModel[]>([]);

  const fetchUser = async (filter) => {
    const response = await fetchUsers(filter);
    setUsers(response.data.users);
  };


  const fetchAllInfo = ()=>{
    const response = await getUsersWithStore()
  }
  return {
    fetchUser,
    users
  }
};
