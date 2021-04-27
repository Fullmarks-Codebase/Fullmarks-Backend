import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { useHistory } from "react-router-dom"
import Cookies from "js-cookie";

function UserDropdown(props) {
  const { userDetail } = props;
  return (
    <li className="dropdown">
      <a
        href="#"
        data-toggle="dropdown"
        className="nav-link dropdown-toggle nav-link-lg nav-link-user"
      >
        <div className="d-sm-none d-lg-inline-block">
          Hi
        </div>
      </a>
      <div className="dropdown-menu dropdown-menu-right">
        {userDetail.datas.map((data, idata) => {
          return (
            <NavLink
              key={idata}
              to={data.link}
              activeStyle={{
                color: "#6777ef",
              }}
              exact
              className="dropdown-item has-icon"
            >
              <i className={data.icode} /> {data.title}
            </NavLink>
          );
        })}

        <div className="dropdown-divider" />
        <a
          className="dropdown-item has-icon text-danger"
          onClick={() => {
            localStorage.removeItem('token')
            Cookies.remove('token')
            window.location.replace("/")
          }}
        >
          <i className={userDetail.logoutIcon} /> {userDetail.logoutTitle}
        </a>
      </div>
    </li>
  );
}


export default UserDropdown;
