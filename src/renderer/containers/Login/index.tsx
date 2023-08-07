import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import LoginHome from '../LoginHome';
import LoginImport from '../LoginImport';
import LoginCreate from '../LoginCreate';
import LoginConditions from '../LoginConditions';

function Login() {
    // const { match } = props;
    return (
        <Routes>
            <Route path="home" element={<LoginHome />} />
            <Route path="/login/import" element={<LoginImport />} />
            {/* <Route path={`create`} element={<LoginCreate />} /> */}
            <Route path="/login/conditions/:type" element={<LoginConditions />} />
            {/* <Route path={'/'} element={<LoginImport />} /> */}
            <Route path="/login" element={<Navigate to="/login/import" />} />
        </Routes>
    );
}

export default Login;
