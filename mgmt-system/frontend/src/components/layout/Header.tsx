import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorMode,
  useColorModeValue,
  Text,
  HStack,
  Badge,
  Tooltip
} from '@chakra-ui/react';
import { 
  FiMenu, 
  FiSearch, 
  FiSun, 
  FiMoon, 
  FiBell, 
  FiSettings, 
  FiLogOut,
  FiUser
} from 'react-icons/fi';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      w="100%"
      px={4}
      py={2}
      bg={bgColor}
      borderBottomWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex align="center">
        <IconButton
          aria-label="Menu"
          icon={<FiMenu />}
          variant="ghost"
          onClick={toggleSidebar}
          mr={4}
        />
        <Text fontSize="xl" fontWeight="bold" display={{ base: 'none', md: 'block' }}>
          ProjectHub
        </Text>
      </Flex>

      <InputGroup maxW="400px" display={{ base: 'none', md: 'block' }}>
        <InputLeftElement pointerEvents="none">
          <FiSearch color="gray.300" />
        </InputLeftElement>
        <Input placeholder="Search projects, tasks..." borderRadius="full" />
      </InputGroup>

      <HStack spacing={3}>
        <Tooltip label="Notifications">
          <IconButton
            aria-label="Notifications"
            icon={
              <Box position="relative">
                <FiBell />
                <Badge
                  position="absolute"
                  top="-8px"
                  right="-8px"
                  colorScheme="red"
                  borderRadius="full"
                  size="sm"
                >
                  3
                </Badge>
              </Box>
            }
            variant="ghost"
          />
        </Tooltip>
        
        <Tooltip label={colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
          />
        </Tooltip>

        <Menu>
          <MenuButton
            as={Button}
            variant="ghost"
            borderRadius="full"
            p={0}
          >
            <Avatar size="sm" name="User Name" src="" />
          </MenuButton>
          <MenuList>
            <MenuItem icon={<FiUser />}>Profile</MenuItem>
            <MenuItem icon={<FiSettings />}>Settings</MenuItem>
            <MenuItem icon={<FiLogOut />}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
};

export default Header; 