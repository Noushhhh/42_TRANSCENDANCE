import React from 'react';
import useActivityLogout from '../tools/hooks/useActivityLogout';

const ActivityLogoutHandler: React.FC = () => {
  useActivityLogout();
  
  return null; // This component does not render anything
};

export default ActivityLogoutHandler;
