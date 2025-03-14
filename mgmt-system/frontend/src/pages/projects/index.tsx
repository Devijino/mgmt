import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Grid,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Badge,
  Progress,
  Avatar,
  AvatarGroup,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
  SimpleGrid,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useDisclosure,
  Tag,
  TagLabel,
  TagLeftIcon,
  Divider
} from '@chakra-ui/react';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiMoreVertical,
  FiStar,
  FiEdit2,
  FiTrash2,
  FiBarChart2,
  FiCheckSquare,
  FiClock,
  FiDollarSign,
  FiTag,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { useProjects } from '@/context/ProjectContext';
import { Project } from '@/context/ProjectContext';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

// Project card component
const ProjectCard = ({ project }: { project: Project }) => {
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const { deleteProject } = useProjects();

  // Status colors
  const statusColors = {
    'planning': 'yellow',
    'active': 'blue',
    'on-hold': 'pink',
    'completed': 'green'
  };

  // Priority colors
  const priorityColors = {
    'low': 'green',
    'medium': 'blue',
    'high': 'red'
  };

  const handleViewProject = () => {
    router.push(`/projects/${project.id}`);
  };

  const handleDeleteProject = () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(project.id);
    }
  };

  const completedTasks = project.tasks.filter(task => task.status === 'done').length;
  const totalTasks = project.tasks.length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const isOverdue = new Date(project.endDate) < new Date() && project.status !== 'completed';

  return (
    <Card
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'md',
        borderColor: 'blue.400'
      }}
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <CardHeader pb={0}>
        <Flex justifyContent="space-between" alignItems="center">
          <Badge colorScheme={statusColors[project.status]} borderRadius="full" px={2}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<FiMoreVertical />}
              variant="ghost"
              size="sm"
            />
            <MenuList>
              <MenuItem icon={<FiEdit2 />} onClick={handleViewProject}>Edit</MenuItem>
              <MenuItem icon={<FiBarChart2 />} onClick={handleViewProject}>Analytics</MenuItem>
              <MenuItem icon={<FiTrash2 />} onClick={handleDeleteProject}>Delete</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        <Heading size="md" mt={2} mb={1}>{project.name}</Heading>
        <Tag size="sm" colorScheme="gray" variant="subtle" mb={3}>
          <TagLeftIcon as={FiTag} />
          <TagLabel>{project.category}</TagLabel>
        </Tag>
      </CardHeader>

      <CardBody py={3}>
        <Text fontSize="sm" color={textColor} noOfLines={2} mb={4}>
          {project.description}
        </Text>

        <Box>
          <Flex justifyContent="space-between" mb={1}>
            <Text fontSize="xs" fontWeight="medium">Progress</Text>
            <Text fontSize="xs">{project.completionPercentage}%</Text>
          </Flex>
          <Progress 
            value={project.completionPercentage} 
            size="sm" 
            colorScheme="blue" 
            borderRadius="full" 
            mb={4}
          />
        </Box>

        <SimpleGrid columns={2} spacing={4} mb={4}>
          <Box>
            <Text fontSize="xs" color={textColor}>Tasks</Text>
            <HStack spacing={1}>
              <Box>
                <Text fontSize="sm" fontWeight="semibold">
                  {completedTasks}/{totalTasks}
                </Text>
              </Box>
              <Text fontSize="xs" color={textColor}>
                ({taskCompletionRate.toFixed(0)}%)
              </Text>
            </HStack>
          </Box>
          <Box>
            <Text fontSize="xs" color={textColor}>Budget</Text>
            <Text fontSize="sm" fontWeight="semibold">
              ${project.budget.toLocaleString()}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color={textColor}>Priority</Text>
            <Badge colorScheme={priorityColors[project.priority]} variant="subtle" borderRadius="full">
              {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
            </Badge>
          </Box>
          <Box>
            <Text fontSize="xs" color={textColor}>Due Date</Text>
            <Text 
              fontSize="sm" 
              fontWeight="semibold" 
              color={isOverdue ? 'red.500' : undefined}
            >
              {new Date(project.endDate).toLocaleDateString()}
            </Text>
          </Box>
        </SimpleGrid>
      </CardBody>

      <CardFooter pt={0} mt="auto">
        <Flex justifyContent="space-between" alignItems="center" width="100%">
          <AvatarGroup size="xs" max={3}>
            {project.team.map((member, idx) => (
              <Avatar key={idx} name={member} />
            ))}
          </AvatarGroup>
          <Button 
            size="sm" 
            onClick={handleViewProject}
            variant="ghost" 
            colorScheme="blue"
          >
            View Project
          </Button>
        </Flex>
      </CardFooter>
    </Card>
  );
};

// Add Project Modal component
const AddProjectModal = ({ isOpen, onClose }) => {
  const { createProject } = useProjects();
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    category: '',
    status: 'planning',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 0,
    expenses: 0,
    team: [],
    priority: 'medium'
  });

  const handleCreateProject = () => {
    createProject(newProject);
    setNewProject({
      name: '',
      description: '',
      category: '',
      status: 'planning',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: 0,
      expenses: 0,
      team: [],
      priority: 'medium'
    });
    onClose();
  };

  const categories = [
    'DevOps', 'AI', 'Automation', 'Finance', 'Cloud', 
    'Marketing', 'E-commerce', 'Mobile', 'Web', 'Other'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Project</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4} isRequired>
            <FormLabel>Project Name</FormLabel>
            <Input 
              value={newProject.name} 
              onChange={(e) => setNewProject({...newProject, name: e.target.value})}
              placeholder="Enter project name"
            />
          </FormControl>
          
          <FormControl mb={4}>
            <FormLabel>Description</FormLabel>
            <Textarea 
              value={newProject.description} 
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              placeholder="Enter project description"
              rows={3}
            />
          </FormControl>
          
          <SimpleGrid columns={2} spacing={4} mb={4}>
            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select 
                value={newProject.category} 
                onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                placeholder="Select category"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select 
                value={newProject.status} 
                onChange={(e) => setNewProject({...newProject, status: e.target.value as any})}
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </Select>
            </FormControl>
          </SimpleGrid>
          
          <SimpleGrid columns={2} spacing={4} mb={4}>
            <FormControl isRequired>
              <FormLabel>Start Date</FormLabel>
              <Input 
                type="date" 
                value={newProject.startDate} 
                onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>End Date</FormLabel>
              <Input 
                type="date" 
                value={newProject.endDate} 
                onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
              />
            </FormControl>
          </SimpleGrid>
          
          <SimpleGrid columns={2} spacing={4} mb={4}>
            <FormControl>
              <FormLabel>Budget ($)</FormLabel>
              <Input 
                type="number" 
                value={newProject.budget} 
                onChange={(e) => setNewProject({...newProject, budget: Number(e.target.value)})}
                min={0}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Priority</FormLabel>
              <Select 
                value={newProject.priority} 
                onChange={(e) => setNewProject({...newProject, priority: e.target.value as any})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </FormControl>
          </SimpleGrid>
          
          <FormControl>
            <FormLabel>Team Members (comma-separated)</FormLabel>
            <Input 
              value={newProject.team.join(', ')} 
              onChange={(e) => setNewProject({...newProject, team: e.target.value.split(',').map(m => m.trim()).filter(Boolean)})}
              placeholder="e.g. John Doe, Jane Smith"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button 
            colorScheme="blue" 
            onClick={handleCreateProject}
            isDisabled={!newProject.name || !newProject.category || !newProject.startDate || !newProject.endDate}
          >
            Create Project
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Main Projects component
export default function Projects() {
  const { projects } = useProjects();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // Filter projects based on search query and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading as="h1" size="lg">
            Projects
          </Heading>
          <Text color={textColor}>Manage and track all your projects in one place</Text>
        </Box>
        
        <Button colorScheme="blue" leftIcon={<FiPlus />} onClick={onOpen}>
          New Project
        </Button>
      </Flex>

      {/* Filters and search */}
      <Flex 
        mb={6} 
        flexDirection={{ base: 'column', md: 'row' }} 
        alignItems={{ base: 'flex-start', md: 'center' }}
        gap={4}
      >
        <InputGroup maxW={{ base: '100%', md: '320px' }}>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        
        <HStack spacing={4} flexGrow={1} justify="space-between" width={{ base: '100%', md: 'auto' }}>
          <HStack>
            <Menu>
              <MenuButton as={Button} rightIcon={<FiFilter />} variant="outline" size="sm">
                Status: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setFilterStatus('all')}>All</MenuItem>
                <MenuItem onClick={() => setFilterStatus('planning')}>Planning</MenuItem>
                <MenuItem onClick={() => setFilterStatus('active')}>Active</MenuItem>
                <MenuItem onClick={() => setFilterStatus('on-hold')}>On Hold</MenuItem>
                <MenuItem onClick={() => setFilterStatus('completed')}>Completed</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
          
          <HStack>
            <IconButton
              aria-label="Grid view"
              icon={<FiGrid />}
              size="sm"
              variant={viewMode === 'grid' ? 'solid' : 'ghost'}
              colorScheme={viewMode === 'grid' ? 'blue' : 'gray'}
              onClick={() => setViewMode('grid')}
            />
            <IconButton
              aria-label="List view"
              icon={<FiList />}
              size="sm"
              variant={viewMode === 'list' ? 'solid' : 'ghost'}
              colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
              onClick={() => setViewMode('list')}
            />
          </HStack>
        </HStack>
      </Flex>

      {/* Project summary stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Flex align="center">
              <Box 
                p={2} 
                bg="blue.50" 
                color="blue.500" 
                borderRadius="md" 
                mr={3}
              >
                <FiBarChart2 size={20} />
              </Box>
              <Box>
                <Text fontSize="sm" color={textColor}>Total Projects</Text>
                <Text fontWeight="bold" fontSize="xl">{projects.length}</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Flex align="center">
              <Box 
                p={2} 
                bg="green.50" 
                color="green.500" 
                borderRadius="md" 
                mr={3}
              >
                <FiCheckSquare size={20} />
              </Box>
              <Box>
                <Text fontSize="sm" color={textColor}>Active</Text>
                <Text fontWeight="bold" fontSize="xl">
                  {projects.filter(p => p.status === 'active').length}
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Flex align="center">
              <Box 
                p={2} 
                bg="red.50" 
                color="red.500" 
                borderRadius="md" 
                mr={3}
              >
                <FiClock size={20} />
              </Box>
              <Box>
                <Text fontSize="sm" color={textColor}>Overdue</Text>
                <Text fontWeight="bold" fontSize="xl">
                  {projects.filter(p => new Date(p.endDate) < new Date() && p.status !== 'completed').length}
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Flex align="center">
              <Box 
                p={2} 
                bg="purple.50" 
                color="purple.500" 
                borderRadius="md" 
                mr={3}
              >
                <FiDollarSign size={20} />
              </Box>
              <Box>
                <Text fontSize="sm" color={textColor}>Total Budget</Text>
                <Text fontWeight="bold" fontSize="xl">
                  ${projects.reduce((sum, project) => sum + project.budget, 0).toLocaleString()}
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Projects grid/list */}
      {filteredProjects.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" mb={4}>No projects found</Text>
          <Text color={textColor} mb={6}>Try adjusting your search or create a new project</Text>
          <Button colorScheme="blue" leftIcon={<FiPlus />} onClick={onOpen}>
            Create New Project
          </Button>
        </Box>
      ) : viewMode === 'grid' ? (
        <SimpleGrid 
          columns={{ base: 1, md: 2, lg: 3, xl: 4 }} 
          spacing={6}
        >
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </SimpleGrid>
      ) : (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
          {filteredProjects.map((project, idx) => (
            <Box key={project.id}>
              <Flex 
                p={4} 
                alignItems="center" 
                bg={useColorModeValue('white', 'gray.800')}
                _hover={{
                  bg: useColorModeValue('gray.50', 'gray.700')
                }}
              >
                <Box flex="1">
                  <Flex alignItems="center" mb={1}>
                    <Heading size="sm">{project.name}</Heading>
                    <Badge 
                      ml={2} 
                      colorScheme={
                        project.status === 'active' ? 'blue' : 
                        project.status === 'planning' ? 'yellow' : 
                        project.status === 'on-hold' ? 'pink' : 
                        'green'
                      }
                      borderRadius="full"
                    >
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                  </Flex>
                  <Text fontSize="sm" color={textColor} noOfLines={1}>
                    {project.description}
                  </Text>
                </Box>
                
                <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
                  <Box textAlign="center" minW="80px">
                    <Text fontSize="xs" color={textColor}>Progress</Text>
                    <Text fontWeight="semibold">{project.completionPercentage}%</Text>
                  </Box>
                  
                  <Box textAlign="center" minW="80px">
                    <Text fontSize="xs" color={textColor}>Due Date</Text>
                    <Text 
                      fontWeight="semibold"
                      color={new Date(project.endDate) < new Date() && project.status !== 'completed' ? 'red.500' : undefined}
                    >
                      {new Date(project.endDate).toLocaleDateString()}
                    </Text>
                  </Box>
                  
                  <Box textAlign="center" minW="80px">
                    <Text fontSize="xs" color={textColor}>Team</Text>
                    <AvatarGroup size="xs" max={3}>
                      {project.team.map((member, idx) => (
                        <Avatar key={idx} name={member} />
                      ))}
                    </AvatarGroup>
                  </Box>
                </HStack>
                
                <NextLink href={`/projects/${project.id}`} passHref>
                  <Button as="a" ml={4} size="sm" colorScheme="blue" variant="ghost">
                    View
                  </Button>
                </NextLink>
              </Flex>
              {idx < filteredProjects.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
      )}

      {/* Add Project Modal */}
      <AddProjectModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
} 