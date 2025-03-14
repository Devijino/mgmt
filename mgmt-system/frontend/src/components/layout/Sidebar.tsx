import React from 'react';
import {
  Box,
  Flex,
  VStack,
  Text,
  Icon,
  Link,
  Divider,
  Badge,
  useColorModeValue,
  Collapse,
  IconButton
} from '@chakra-ui/react';
import {
  FiHome,
  FiCheckSquare,
  FiCalendar,
  FiFolder,
  FiBarChart2,
  FiSettings,
  FiDollarSign,
  FiZap,
  FiCpu,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { useState } from 'react';

interface NavItemProps {
  icon: any;
  children: React.ReactNode;
  path: string;
  badge?: string | number;
  isActive?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, children, path, badge, isActive }) => {
  const router = useRouter();
  const isCurrentPath = router.pathname === path || isActive;
  const activeBg = useColorModeValue('primary.50', 'gray.700');
  const activeColor = useColorModeValue('primary.700', 'white');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <NextLink href={path} passHref>
      <Link
        display="flex"
        alignItems="center"
        px={4}
        py={3}
        borderRadius="md"
        transition="all 0.3s"
        fontWeight={isCurrentPath ? 'semibold' : 'normal'}
        color={isCurrentPath ? activeColor : inactiveColor}
        bg={isCurrentPath ? activeBg : 'transparent'}
        _hover={{
          bg: activeBg,
          color: activeColor,
        }}
        style={{ textDecoration: 'none' }}
      >
        <Icon as={icon} mr={3} boxSize={5} />
        <Text>{children}</Text>
        {badge && (
          <Badge ml="auto" colorScheme="primary" borderRadius="full">
            {badge}
          </Badge>
        )}
      </Link>
    </NextLink>
  );
};

const ProjectsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleOpen = () => setIsOpen(!isOpen);
  
  const recentProjects = [
    { id: '1', name: 'AI Chatbot Development' },
    { id: '2', name: 'E-commerce Platform Redesign' },
    { id: '3', name: 'Mobile App Automation' },
  ];

  const inactiveColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box width="100%">
      <Flex
        alignItems="center"
        justifyContent="space-between"
        px={4}
        py={3}
        cursor="pointer"
        onClick={toggleOpen}
        color={inactiveColor}
        _hover={{ color: useColorModeValue('primary.700', 'white') }}
      >
        <Flex alignItems="center">
          <Icon as={FiFolder} mr={3} boxSize={5} />
          <Text>Projects</Text>
        </Flex>
        <IconButton
          aria-label="Toggle projects"
          icon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
          variant="ghost"
          size="sm"
        />
      </Flex>
      
      <Collapse in={isOpen} animateOpacity>
        <VStack pl={10} pb={3} align="stretch" spacing={1}>
          {recentProjects.map(project => (
            <NextLink key={project.id} href={`/projects/${project.id}`} passHref>
              <Link
                display="block"
                py={2}
                px={3}
                borderRadius="md"
                transition="all 0.3s"
                _hover={{
                  bg: useColorModeValue('primary.50', 'gray.700'),
                  color: useColorModeValue('primary.700', 'white'),
                }}
                fontSize="sm"
              >
                {project.name}
              </Link>
            </NextLink>
          ))}
          <NextLink href="/projects" passHref>
            <Link
              display="block"
              py={2}
              px={3}
              color="primary.500"
              fontSize="sm"
              fontWeight="medium"
            >
              View all projects
            </Link>
          </NextLink>
        </VStack>
      </Collapse>
    </Box>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      position="fixed"
      left={0}
      width={{ base: 'full', md: '250px' }}
      height="calc(100vh - 60px)"
      bg={bgColor}
      borderRightWidth="1px"
      borderColor={borderColor}
      transform={{
        base: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        md: 'translateX(0)',
      }}
      transition="transform 0.3s ease"
      zIndex={10}
      overflowY="auto"
      py={4}
    >
      <VStack spacing={1} align="stretch">
        <NavItem icon={FiHome} path="/">
          Dashboard
        </NavItem>
        <NavItem icon={FiCheckSquare} path="/tasks" badge={5}>
          Tasks
        </NavItem>
        <NavItem icon={FiCalendar} path="/calendar">
          Calendar
        </NavItem>
        
        <ProjectsDropdown />
        
        <NavItem icon={FiBarChart2} path="/analytics">
          Analytics
        </NavItem>
        
        <Divider my={3} />
        
        <Box px={4} mb={2}>
          <Text fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.500">
            Tools
          </Text>
        </Box>
        
        <NavItem icon={FiZap} path="/automations">
          Automations
        </NavItem>
        <NavItem icon={FiCpu} path="/ai-assistant">
          AI Assistant
        </NavItem>
        <NavItem icon={FiDollarSign} path="/finances">
          Finances
        </NavItem>
        <NavItem icon={FiSettings} path="/settings">
          Settings
        </NavItem>
      </VStack>
    </Box>
  );
};

export default Sidebar; 