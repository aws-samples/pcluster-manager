// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//
// Licensed under the Apache License,
 Version 2.0 (
the "License",
). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND,
 express or implied. See the License for the specific language governing permissions and
// limitations under the License.
import React from 'react';
import { useSelector } from 'react-redux'
import { useCollection } from '@awsui/collection-hooks';
import { clearState, setState, useState } from '../../store'

import { CreateUser, DeleteUser, ListUsers, SetUserRole } from '../../model'

// UI Elements
import {
  AppLayout,
  Button,
  Container,
  Header,
  Input,
  Pagination,
  Select,
  SpaceBetween,
  Table,
  TextFilter
} from "@awsui/components-react";

// Components
import EmptyState from '../../components/EmptyState';
import SideBar from '../../components/SideBar';
import Loading from '../../components/Loading'
import DateView from '../../components/DateView'
import { DeleteDialog,
 showDialog,
 hideDialog } from '../../components/DeleteDialog';

// selectors
const selectUserIndex = state => state.users.index

function userToRole(user) {
  let user_groups = new Set(user.Groups.map(group => group.GroupName));
  for(const group of ["admin", "user"])
    if(user_groups.has(group))
      return group
  return "guest";
}

function RoleSelector(props) {
  const current_group = userToRole(props.user);
  const [pending, setPending] = React.useState(false);

  return (
    <div>
      { pending ? <Loading text="Updating..." /> : 
      <Select
        expandToViewport
        placeholder="Role"
        selectedOption={{label: current_group.charAt(
0,
).toUpperCase() + current_group.slice(
1,
),
 value: current_group}}
        onChange={({ detail }) => {
          setPending(true);
          SetUserRole(
props.user,
 detail.selectedOption.value,
 (
user,
) => {setPending(
false,
)},
);
        }}
        options={[
          { label: "Guest", value: "guest" },
          { label: "User", value: "user" },
          { label: "Admin", value: "admin" },
        ]}
        selectedAriaLabel="Selected"
      />
      }
    </div>
  )
}

function UserActions({user}) {
  return <SpaceBetween direction="horizontal" size="s">
    <Button className="action" onClick={() => {setState(
['app',
 'user',
 'delete'],
 user,
); showDialog(
'deleteUser',
)}}>Delete</Button>
  </SpaceBetween>
}

function UserList(props) {
  const user_index = useSelector(selectUserIndex) || {};
  const usernames = Object.keys(user_index).sort();
  const users = usernames.map((username) => user_index[username]);
  const userEmail = useState(['app', 'user', 'delete', 'Attributes', 'email']);
  const user = useState(['app', 'user', 'delete']);

  const { items,
 actions,
 filteredItemsCount,
 collectionProps,
 filterProps,
 paginationProps } = useCollection(
    users,
    {
      filtering: {
        empty: (
          <EmptyState
            title="No users"
            subtitle="No users to display."
            action={<></>}
          />
        ),
        noMatch: (
          <EmptyState
            title="No matches"
            subtitle="No users match the filters."
            action={<Button onClick={() => actions.setFiltering(
'',
)}>Clear filter</Button>}
          />
        ),
      },
      pagination: { pageSize: 10 },
      sorting: {},
      selection: {},
    }
  );

  const deleteUser = () => {
    console.log(user);
    DeleteUser(
user,
 (
returned_user,
) => {clearState(
['users',
 'index',
 returned_user.Username],
)},
);
    hideDialog('deleteUser');
  }

  return (<>
    <DeleteDialog id='deleteUser' header='Delete User?' deleteCallback={deleteUser}>
      Are you sure you want to delete user {userEmail}?
    </DeleteDialog>
    <Table
      {...collectionProps}
      resizableColumns
      trackBy={item => item.Attributes && item.Attributes.email}
      columnDefinitions={[
        {
          id: "username",
          header: "Username",
          cell: item => item.Username,
          sortingField: "Username"
        },
        {
          id: "email",
          header: "Email",
          cell: item => item.Attributes.email || "-",
          sortingField: "Attributes.email"
        },
        {
          id: "role",
          header: "Role",
          cell: item => <RoleSelector user={item} />,
          sortingField: "Groups"
        },
        {
          id: "created",
          header: "Created",
          cell: item => <DateView date={item.UserCreateDate} />,
          sortingField: "UserCreateDate"
        },
        {
          id: "action",
          header: "Action",
          cell: item => <UserActions user={item} /> || "-",
        }
      ]}
      loading={users === null}
      items={items}
      loadingText="Loading users..."
      pagination={<Pagination {...paginationProps} />}
      filter={
        <TextFilter
          {...filterProps}
          countText={`Results: ${filteredItemsCount}`}
          filteringAriaLabel="Filter users"
        />
      }
    /></>
  );
}

export default function Users() {
  const users = useSelector(selectUserIndex);
  const navigationOpen = useState(['app', 'sidebar', 'drawerOpen']);
  const usernamePath = ['app', 'users', 'email'];
  const username = useState(usernamePath);
  const refreshUsers = () => {
    ListUsers();
  }

  const createUser = () => {
    let user = {Username: username};
    CreateUser(user, () => {clearState(['app', 'users', 'email'])});
  }

  React.useEffect(() => {
    ListUsers();
  }, [])

  return (
    <AppLayout
      className="app-layout"
      headerSelector="#top-bar"
      navigationWidth="220px"
      toolsHide={true}
      splitHide={true}
      navigationOpen = {navigationOpen}
      onNavigationChange = {(
e,
) => {setState(
['app',
 'sidebar',
 'drawerOpen'],
 e.detail.open,
)}}
      content={
          <Container
            header={
              <Header
                variant="h2"
                description=""
                counter={ users && `(${Object.keys(users).length})` }
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <div onKeyPress={e => e.key == 'Enter' && createUser()}>
                      <Input onChange={(
{ detail },
) => setState(
usernamePath,
 detail.value,
)} value={username} placeholder='email@domain.com' onSubmit={createUser}></Input>
                    </div>
                    <Button className="action" onClick={createUser}>Create User</Button>
                    <Button className="action" onClick={refreshUsers} iconName={"refresh"}>Refresh</Button>
                  </SpaceBetween>}>
                Users
              </Header>
            }>
            {users ? <UserList /> : <Loading />}
          </Container>
      }
      navigation={<SideBar />}
    />
  );
}
