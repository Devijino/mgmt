import React, { ReactNode, useState } from 'react';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <Flex h="100vh" flexDirection="column">
      <Header toggleSidebar={toggleSidebar} />
      <Flex flex="1" overflow="hidden">
        <Sidebar isOpen={isSidebarOpen} />
        <Box
          flex="1"
          p={4}
          bg={bgColor}
          overflowY="auto"
          transition="all 0.3s"
          ml={isSidebarOpen ? { base: 0, md: '250px' } : 0}
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default Layout; 