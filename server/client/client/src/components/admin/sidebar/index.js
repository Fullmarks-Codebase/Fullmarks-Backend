import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { Data } from "./data";
import "../../../js/js/scripts";
import "../../../js/js/custom";
import globalContext from "../../../context/globalContext";

function SideBar() {
  const { user } = useContext(globalContext);
  let menus = [];
  if (user) {
    if (!user.userAccessModules) {
      menus = Data.menus;
    } else {
      let userAccessModules = user.userAccessModules;
      if (userAccessModules) {
        menus = Data.menus.filter((item) => {
          if (userAccessModules.includes(item.id)) {
            return item;
          }
        });
      }
    }
  }
  return (
    <div className='main-sidebar'>
      <aside id='sidebar-wrapper'>
        <div className='sidebar-brand'>
          <Link to='/dashboard'> FullMarks </Link>
        </div>
        <div className='sidebar-brand sidebar-brand-sm'>
          <Link to='/dashboard'> FM </Link>
        </div>
        <ul className='sidebar-menu mb-5'>
          {menus.map((menu, iMenu) => {
            let comp;
            if (menu.header) {
              comp = (
                <li key={iMenu} className='menu-header'>
                  {menu.name}
                </li>
              );
            } else if (menu.dropdown) {
              if (menu.active) {
                comp = (
                  <li key={iMenu} className='nav-item dropdown active'>
                    <a href='/#' className='nav-link has-dropdown'>
                      <i className={menu.icon} /> <span> {menu.name} </span>
                    </a>
                    <ul className='dropdown-menu'>
                      {menu.children.map((submenu, iSubmenu) => {
                        let subComp;
                        if (submenu.active) {
                          if (submenu.beep) {
                            subComp = (
                              <li key={iSubmenu} className='active'>
                                <NavLink
                                  activeStyle={{
                                    color: " #6777ef",
                                    fontWeight: "600",
                                  }}
                                  exact
                                  className='beep beep-sidebar'
                                  to={submenu.url}
                                >
                                  {submenu.name}
                                </NavLink>
                              </li>
                            );
                          } else {
                            subComp = (
                              <li key={iSubmenu}>
                                <NavLink
                                  activeStyle={{
                                    color: " #6777ef",
                                    fontWeight: "600",
                                  }}
                                  exact
                                  to={submenu.url}
                                >
                                  {submenu.name}
                                </NavLink>
                              </li>
                            );
                          }
                        } else if (submenu.beep) {
                          subComp = (
                            <li key={iSubmenu}>
                              <NavLink
                                activeStyle={{
                                  color: " #6777ef",
                                  fontWeight: "600",
                                }}
                                exact
                                className='beep beep-sidebar'
                                to={submenu.url}
                              >
                                {submenu.name}
                              </NavLink>
                            </li>
                          );
                        } else {
                          subComp = (
                            <li key={iSubmenu}>
                              <NavLink
                                activeStyle={{
                                  color: " #6777ef",
                                  fontWeight: "600",
                                }}
                                exact
                                to={submenu.url}
                              >
                                {submenu.name}
                              </NavLink>
                            </li>
                          );
                        }

                        return subComp;
                      })}
                    </ul>
                  </li>
                );
              } else {
                comp = (
                  <li key={iMenu} className='nav-item dropdown'>
                    <a href='/#' className='nav-link has-dropdown'>
                      <i className={menu.icon} /> <span> {menu.name} </span>
                    </a>
                    <ul className='dropdown-menu'>
                      {menu.children.map((submenu, iSubmenu) => {
                        let subComp;
                        if (submenu.active) {
                          if (submenu.beep) {
                            subComp = (
                              <li key={iSubmenu} className='active'>
                                <NavLink
                                  activeStyle={{
                                    color: " #6777ef",
                                    fontWeight: "600",
                                  }}
                                  exact
                                  className='beep beep-sidebar'
                                  to={submenu.url}
                                >
                                  {submenu.name}
                                </NavLink>
                              </li>
                            );
                          } else {
                            subComp = (
                              <li key={iSubmenu} className='active'>
                                <NavLink
                                  activeStyle={{
                                    color: " #6777ef",
                                    fontWeight: "600",
                                  }}
                                  exact
                                  to={submenu.url}
                                >
                                  {submenu.name}
                                </NavLink>
                              </li>
                            );
                          }
                        } else if (submenu.beep) {
                          subComp = (
                            <li key={iSubmenu}>
                              <NavLink
                                activeStyle={{
                                  color: " #6777ef",
                                  fontWeight: "600",
                                }}
                                exact
                                className='beep beep-sidebar'
                                to={submenu.url}
                              >
                                {submenu.name}
                              </NavLink>
                            </li>
                          );
                        } else {
                          subComp = (
                            <li key={iSubmenu}>
                              <NavLink
                                activeStyle={{
                                  color: " #6777ef",
                                  fontWeight: "600",
                                }}
                                exact
                                to={submenu.url}
                              >
                                {submenu.name}
                              </NavLink>
                            </li>
                          );
                        }

                        return subComp;
                      })}
                    </ul>
                  </li>
                );
              }
            } else if (menu.active) {
              //
              comp = (
                <li key={iMenu} className='s'>
                  <NavLink
                    activeStyle={{
                      color: " #6777ef",
                      fontWeight: "600",
                    }}
                    exact
                    to={menu.url}
                  >
                    <i className={menu.icon} /> <span> {menu.name} </span>
                  </NavLink>
                </li>
              );
            } else {
              //Single Component
              comp = (
                <li key={iMenu}>
                  <NavLink
                    activeStyle={{
                      color: " #6777ef",
                      fontWeight: "600",
                    }}
                    exact
                    to={menu.url}
                  >
                    <i className={menu.icon} /> <span> {menu.name} </span>
                  </NavLink>
                </li>
              );
            }

            return comp;
          })}
        </ul>
      </aside>
    </div>
  );
}

export default React.memo(SideBar);
