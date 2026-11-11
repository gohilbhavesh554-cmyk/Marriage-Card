import React from 'react';
import { InvitationCanvas } from '../components/InvitationCanvas';
import { DEMO_WEDDING_PROJECT, DEMO_WEDDING_EVENTS } from '../data/templatesAndDemo';

export const LandingPage: React.FC = () => {
  return (
    <InvitationCanvas
      project={DEMO_WEDDING_PROJECT}
      events={DEMO_WEDDING_EVENTS}
      showTemplateBar={true}
    />
  );
};
