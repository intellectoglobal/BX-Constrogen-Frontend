import React from 'react'
import {
    Link,
    useMatch,
    useResolvedPath,
} from "react-router-dom";
import { Button } from 'primereact/button';
import type { ButtonProps } from 'primereact/button';

interface Props extends ButtonProps {
    to: string;
}

const NavLinkButton = ({ to, className, ...props }: Props) => {
    let resolved = useResolvedPath(to);
    let match = useMatch({ path: resolved.pathname, end: false });
    return (
        <Link
            style={{ textDecoration: "none" }}
            to={to}
        >
            <Button className={(className || '') + (match ? " p-button-selected" : '')} {...props} />
        </Link>
    )
}

export default NavLinkButton