import React from 'react'
import {
    ProSidebar,
    Menu,
    MenuItem,
    SidebarHeader,
    SidebarFooter,
    SidebarContent,
} from 'react-pro-sidebar';
import {
    AiOutlineSetting,
    AiOutlinePlus,
    AiOutlineHome,
    AiOutlineOrderedList,
    AiFillPrinter
} from 'react-icons/ai';
import { BsPeopleFill } from 'react-icons/bs';
import { MdCategory } from 'react-icons/md';
import { HiOutlineDocumentDuplicate } from 'react-icons/hi';
import 'react-pro-sidebar/dist/css/styles.css';
import { invoke } from "@tauri-apps/api"
import { HasSend } from "../machines/fileMachine"
import { HasPageSend } from '../machines/pageMachine';

const AppSideBar: React.FC<HasSend & HasPageSend> = ({ xsend, xpagesend }) => {
    return (
        <div id="navbar">
            <ProSidebar
            //   image={image ? sidebarBg : false}
            //   rtl={rtl}
            //   collapsed={collapsed}
            //   toggled={false}
            //   breakPoint="md"
            //   onToggle={handleToggleSidebar}
            >
                <SidebarHeader>
                    <div
                        style={{
                            padding: '24px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            fontSize: 14,
                            letterSpacing: '1px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Tournament ARK
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <Menu iconShape="circle">
                        <MenuItem
                            icon={<AiOutlinePlus />}
                            // suffix={<span className="badge red">new</span>}
                            onClick={() => {
                                xpagesend({ type: "PE_ADD_ENTRY" });
                            }}
                        >
                            Add Entry
                        </MenuItem>
                    </Menu>
                    <Menu iconShape="circle">
                        <MenuItem
                            icon={<AiOutlineHome />}
                            // suffix={<span className="badge red">new</span>}
                            onClick={() => {
                                xpagesend({ type: "PE_HOME" });
                            }}
                        >
                            Home
                        </MenuItem>
                        <MenuItem
                            icon={<AiOutlineOrderedList />}
                            // suffix={<span className="badge red">new</span>}
                            onClick={() => {
                                xpagesend({ type: "PE_LIST_ENTRIES" });
                            }}
                        >
                            Entries
                        </MenuItem>
                        <MenuItem
                            icon={<MdCategory />}
                            // suffix={<span className="badge red">new</span>}
                            onClick={() => {
                                xpagesend({ type: "PE_LIST_CATEGORIES" });
                            }}
                        >
                            Categories
                        </MenuItem>
                        <MenuItem
                            icon={<HiOutlineDocumentDuplicate />}
                            // suffix={<span className="badge red">new</span>}
                            // style={xpagecurrent.matches("") ? { color: 'skyblue' } : {}}
                            onClick={() => {
                                xpagesend({ type: "PE_LIST_ENTRY_CARDS" });
                            }}
                        >
                            Entry Cards
                        </MenuItem>
                        <MenuItem
                            icon={<BsPeopleFill style={{ color: 'red' }} />}
                            // suffix={<span className="badge red">new</span>}
                            onClick={() => {
                                xpagesend({ type: "PE_LIST_PEOPLE" });
                            }}
                        >
                            People
                        </MenuItem>
                    </Menu>
                    {/* <Menu iconShape="circle">
                        <SubMenu
                            suffix={<span className="badge yellow">3</span>}
                            title="withSuffix"
                        // icon={<FaRegLaughWink />}
                        >
                            <MenuItem>submenu 1</MenuItem>
                            <MenuItem>submenu 2</MenuItem>
                            <MenuItem>submenu 3</MenuItem>
                        </SubMenu>
                        <SubMenu
                            //prefix={<span className="badge gray">3</span>}
                            title="withPrefix"
                        //icon={<FaHeart />}
                        >
                            <MenuItem>submenu 1</MenuItem>
                            <MenuItem>submenu 2</MenuItem>
                            <MenuItem>submenu 3</MenuItem>
                        </SubMenu>
                        <SubMenu title="multilevel">
                            <MenuItem>submenu 1 </MenuItem>
                            <MenuItem>submenu 2 </MenuItem>
                            <SubMenu title="submenu 3">
                                <MenuItem>submenu 3.1 </MenuItem>
                                <MenuItem>submenu 3.2 </MenuItem>
                                <SubMenu title={`submenu 3.3`}>
                                    <MenuItem>submenu 3.3.1</MenuItem>
                                    <MenuItem>submenu 3.3.2</MenuItem>
                                    <MenuItem>submenu 3.3.3</MenuItem>
                                </SubMenu>
                            </SubMenu>
                        </SubMenu>
                    </Menu> */}
                </SidebarContent>

                <SidebarFooter style={{ textAlign: 'center' }}>
                    <Menu iconShape="circle">
                        <MenuItem
                            icon={<AiFillPrinter />}
                            // suffix={<span className="badge red">new</span>}
                                onClick={() => { window.print() }}
                        >
                            Print
                        </MenuItem>
                        <MenuItem
                            icon={<AiOutlineSetting />}
                            onClick={() => {
                                xpagesend({ type: "PE_OPTIONS" })
                            }}
                        >
                            Settings
                        </MenuItem>
                        <MenuItem
                            icon="❌"
                            onClick={() => {
                                invoke('close_db');
                            }}
                        >
                            Close Database
                        </MenuItem>
                    </Menu>
                </SidebarFooter>
            </ProSidebar>
        </div>
    );
}

export default AppSideBar;