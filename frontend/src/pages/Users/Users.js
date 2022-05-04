// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.
import React from 'react';
import { useSelector } from 'react-redux'
import { useCollection } from '@awsui/collection-hooks';
import { clearState, setState, getState, useState } from '../../store'

import { CreateUser, DeleteUser, ListUsers, SetUserRole } from '../../model'

// UI Elements
import {
  Button,
  Container,
  FormField,
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
import Loading from '../../components/Loading'
import DateView from '../../components/DateView'
import HelpTooltip from '../../components/HelpTooltip'
import { DeleteDialog,
 showDialog,
 hideDialog } from '../../components/DeleteDialog';

// Constants
const errorsPath = ['app', 'wizard', 'errors', 'user'];

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
        selectedOption={{label: current_group.charAt(0,).toUpperCase() + current_group.slice(1,),value: current_group}}
        onChange={({ detail }) => {setPending(true);SetUserRole(props.user,detail.selectedOption.value,(user,) => {setPending(false,)},);}}
        options={[
          { label: "Guest", value: "guest" },
          { label: "User", value: "user" },
          { label: "Admin", value: "admin" },
        ]}
        selectedAriaLabel="Selected"/>
      }</div>)
}

function UserActions({user}) {
  let email = useState(['identity', 'attributes', 'email']);
  return <SpaceBetween direction="horizontal" size="s">
    <Button disabled={email === user.Attributes.email} className="action" onClick={() => {setState(['app','user','delete'], user); showDialog('deleteUser')}}>Delete</Button>
  </SpaceBetween>
}

function UserList(props) {
  const user_index = useSelector(selectUserIndex) || {};
  const usernames = Object.keys(user_index).sort();
  const users = usernames.map((username) => user_index[username]);
  const userEmail = useState(['app', 'user', 'delete', 'Attributes', 'email']);
  const user = useState(['app', 'user', 'delete']);

  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
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
              action={<Button onClick={() => actions.setFiltering('')}>Clear filter</Button>}
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
    DeleteUser(user, (returned_user) => {clearState(['users', 'index', returned_user.Username])});
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
          header: <div className='whiteSpace'>Role<HelpTooltip><b>Guest</b> can login but not see any clusters.<b>User</b> can see clusters and access clusters but not create or delete. <b>Admin</b> has full access.</HelpTooltip></div>,
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
          filteringAriaLabel="Filter users" />}/></>
  );
}

function userValidate() {
  const username = getState(['app', 'users', 'newUser', 'Username']);
  setState([...errorsPath, 'validated'], true);
  let valid = true;

  const regex = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;
  if (!regex.test(username))
  {
    setState([...errorsPath, 'username'], 'You must enter a valid email.');
    valid = false;
    setState([...errorsPath, 'validated'], false);
  } else {
    clearState([...errorsPath, 'username']);
  }

  return valid;
}

export default function Users() {
  const users = useSelector(selectUserIndex);
  const error = useState([...errorsPath, 'username']);

  const user = useState(['app', 'users', 'newUser'])

  const usernamePath = ['app', 'users', 'newUser', 'Username'];
  const username = useState(usernamePath);

  const userphonePath = ['app', 'users', 'newUser', 'Phonenumber'];
  const userphone = useState(userphonePath);

  const enableMfa = useState(['app', 'enableMfa']);
  const refreshUsers = () => {
    ListUsers();
  }

  const createUser = () => {
    userValidate();
    const validated = getState([...errorsPath, 'validated']);
    if (validated) {
      CreateUser(user, () => {clearState(['app', 'users', 'newUser'])});
    }
  }

  React.useEffect(() => {
    ListUsers();
  }, [])

  return <Container
    header={
      <Header
        variant="h2"
        description=""
        counter={ users && `(${Object.keys(users).length})` }
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            {enableMfa && <Input inputMode='tel' onChange={({ detail }) => setState(userphonePath, detail.value)} value={userphone} placeholder='+11234567890'></Input>}
            <div onKeyPress={e => e.key === 'Enter' && createUser()}>
              <FormField errorText={error}>
                <Input onChange={({ detail }) => setState(usernamePath, detail.value)} value={username} placeholder='email@domain.com' onSubmit={createUser}></Input>
              </FormField>
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
