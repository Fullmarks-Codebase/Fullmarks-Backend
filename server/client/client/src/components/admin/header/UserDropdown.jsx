import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import Cookies from "js-cookie";
import globalContext from "../../../context/globalContext";

function UserDropdown(props) {
  const { userDetail } = props;
  const { user } = useContext(globalContext);

  return (
    <li className='dropdown'>
      <a
        href='/#'
        data-toggle='dropdown'
        className='nav-link dropdown-toggle nav-link-lg nav-link-user'
      >
        <div className='d-sm-none d-lg-inline-block'>Hi {user?.username}</div>
      </a>
      <div className='dropdown-menu dropdown-menu-right'>
        {userDetail.datas.map((data, idata) => {
          return (
            <NavLink
              key={idata}
              to={data.link}
              activeStyle={{
                color: "#6777ef",
              }}
              exact
              className='dropdown-item has-icon'
            >
              <i className={data.icode} /> {data.title}
            </NavLink>
          );
        })}

        <div className='dropdown-divider' />
        <a
          href='/#'
          className='dropdown-item has-icon text-danger'
          onClick={() => {
            localStorage.removeItem("token");
            Cookies.remove("token");
            window.location.replace("/");
          }}
        >
          <i className={userDetail.logoutIcon} /> {userDetail.logoutTitle}
        </a>
      </div>
    </li>
  );
}

export default UserDropdown;
