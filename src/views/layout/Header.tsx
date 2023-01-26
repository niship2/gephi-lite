import { FC } from "react";
import { Link } from "react-router-dom";

import { UserMenu } from "./UserMenu";

export const Header: FC = () => {
  return (
    <header className="navbar-dark bg-dark">
      <div className="py-1 px-3 d-flex flex-column flex-md-row align-items-center">
        <Link to="/" title="Home" className="navbar-brand">
          Gephi-lite
        </Link>

        <div className="d-flex flex-grow-1 align-items-center justify-content-end">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
