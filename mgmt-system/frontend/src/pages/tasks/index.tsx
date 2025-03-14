import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Badge,
  IconButton,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  SimpleGrid,
  HStack,
  Tooltip,
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
  Card,
  CardBody,
  Avatar
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiFilter, 
  FiCalendar, 
  FiClock,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiTag
} from 'react-icons/fi';
import { useProjects } from '@/context/ProjectContext';
import { Task, Project } from '@/context/ProjectContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Task item component
const TaskItem = ({ task, project }: { task: Task; project: Project }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const { updateTask, deleteTask } = useProjects();

  const priorityColors = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  return (
    <Card 
      bg={bgColor} 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="md" 
      boxShadow="sm"
      mb={3}
      _hover={{ 
        boxShadow: 'md',
        borderColor: 'blue.400'
      }}
      transition="all 0.2s"
    >
      <CardBody p={3}>
        <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Badge colorScheme={priorityColors[task.priority]} borderRadius="full" px={2}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
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
              <MenuItem icon={<FiEdit2 />}>Edit</MenuItem>
              <MenuItem icon={<FiTrash2 />} onClick={handleDelete}>Delete</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        
        <Heading size="sm" mb={1} noOfLines={2}>{task.title}</Heading>
        <Text fontSize="sm" color={textColor} mb={3} noOfLines={2}>
          {task.description}
        </Text>
        
        <Text fontSize="xs" mb={2} color={textColor}>
          <Flex align="center">
            <Box as={FiUser} mr={1} />
            {task.assignedTo || 'Unassigned'}
          </Flex>
        </Text>
        
        <HStack spacing={2} mt={2}>
          {task.tags.slice(0, 2).map((tag, index) => (
            <Badge 
              key={index} 
              colorScheme="gray" 
              fontSize="xs"
              variant="subtle"
              borderRadius="full"
            >
              {tag}
            </Badge>
          ))}
          {task.tags.length > 2 && (
            <Badge colorScheme="gray" fontSize="xs" variant="subtle" borderRadius="full">
              +{task.tags.length - 2}
            </Badge>
          )}
        </HStack>
        
        <Flex justifyContent="space-between" alignItems="center" mt={3}>
          <Tooltip label={project.name}>
            <Avatar size="xs" name={project.name} />
          </Tooltip>
          <Text 
            fontSize="xs" 
            color={new Date(task.dueDate) < new Date() ? 'red.500' : textColor}
            fontWeight={new Date(task.dueDate) < new Date() ? 'semibold' : 'normal'}
          >
            <Flex align="center">
              <Box as={FiCalendar} mr={1} />
              {new Date(task.dueDate).toLocaleDateString()}
            </Flex>
          </Text>
        </Flex>
      </CardBody>
    </Card>
  );
};

// Kanban column component
const KanbanColumn = ({ title, tasks, status, projectMap }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { createTask } = useProjects();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status,
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    assignedTo: null,
    projectId: '',
    tags: [],
    estimatedHours: 1,
    actualHours: 0
  });

  const handleCreateTask = () => {
    createTask(newTask);
    setNewTask({
      title: '',
      description: '',
      status,
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      assignedTo: null,
      projectId: '',
      tags: [],
      estimatedHours: 1,
      actualHours: 0
    });
    onClose();
  };

  // Status colors and icons
  const statusColors = {
    'todo': 'gray.500',
    'in-progress': 'blue.500',
    'review': 'purple.500',
    'done': 'green.500',
  };

  return (
    <Box>
      <Flex 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        pb={2}
        borderBottomWidth="2px"
        borderBottomColor={statusColors[status]}
      >
        <Heading size="sm">{title}</Heading>
        <Text borderRadius="full" bg={statusColors[status]} color="white" px={2} py={1} fontSize="xs">
          {tasks.length}
        </Text>
      </Flex>

      <Droppable droppableId={status}>
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            bg={bgColor}
            p={2}
            borderRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
            minH="calc(100vh - 300px)"
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskItem task={task} project={projectMap[task.projectId]} />
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            
            <Button 
              leftIcon={<FiPlus />} 
              onClick={onOpen}
              size="sm"
              variant="ghost"
              width="100%"
              justifyContent="flex-start"
              mt={2}
            >
              Add Task
            </Button>
          </Box>
        )}
      </Droppable>

      {/* Add Task Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Title</FormLabel>
              <Input 
                value={newTask.title} 
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Task title"
              />
            </FormControl>
            
            <FormControl mb={3}>
              <FormLabel>Description</FormLabel>
              <Textarea 
                value={newTask.description} 
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Task description"
              />
            </FormControl>
            
            <FormControl mb={3}>
              <FormLabel>Project</FormLabel>
              <Select 
                value={newTask.projectId} 
                onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                placeholder="Select project"
              >
                {Object.values(projectMap).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <SimpleGrid columns={2} spacing={3}>
              <FormControl>
                <FormLabel>Priority</FormLabel>
                <Select 
                  value={newTask.priority} 
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Due Date</FormLabel>
                <Input 
                  type="date" 
                  value={newTask.dueDate} 
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </FormControl>
            </SimpleGrid>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button 
              colorScheme="blue" 
              onClick={handleCreateTask}
              isDisabled={!newTask.title || !newTask.projectId}
            >
              Create Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default function Tasks() {
  const { projects } = useProjects();
  const bgColor = useColorModeValue('white', 'gray.800');
  const [filterProject, setFilterProject] = useState('all');
  
  // Create a project map for easy lookup
  const projectMap = projects.reduce((acc, project) => {
    acc[project.id] = project;
    return acc;
  }, {});
  
  // Get all tasks from all projects
  const allTasks = projects.flatMap(p => p.tasks);
  
  // Filter tasks based on selected project
  const filteredTasks = filterProject === 'all' 
    ? allTasks 
    : allTasks.filter(task => task.projectId === filterProject);
  
  // Group tasks by status
  const groupedTasks = {
    'todo': filteredTasks.filter(t => t.status === 'todo'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    'review': filteredTasks.filter(t => t.status === 'review'),
    'done': filteredTasks.filter(t => t.status === 'done'),
  };
  
  // Handle drag and drop
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    
    // If no destination or same destination, do nothing
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Find the task that was dragged
    const task = allTasks.find(t => t.id === draggableId);
    
    if (task && destination.droppableId !== task.status) {
      // Update task status
      const { updateTask } = useProjects();
      updateTask(task.id, { status: destination.droppableId });
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading as="h1" size="lg">
            Tasks
          </Heading>
          <Text color="gray.500">Manage and organize your tasks</Text>
        </Box>
        
        <HStack spacing={3}>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<FiFilter />}
              variant="outline"
              size="sm"
            >
              Filter: {filterProject === 'all' ? 'All Projects' : projectMap[filterProject]?.name}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setFilterProject('all')}>All Projects</MenuItem>
              <MenuItem onClick={() => setFilterProject('all')} icon={<FiTag />}>By Tag</MenuItem>
              <MenuItem onClick={() => setFilterProject('all')} icon={<FiUser />}>By Assignee</MenuItem>
              <MenuItem onClick={() => setFilterProject('all')} icon={<FiCalendar />}>By Due Date</MenuItem>
              <MenuItem onClick={() => setFilterProject('all')} icon={<FiClock />}>By Priority</MenuItem>
              <MenuList title="Projects">
                {projects.map((project) => (
                  <MenuItem 
                    key={project.id} 
                    onClick={() => setFilterProject(project.id)}
                  >
                    {project.name}
                  </MenuItem>
                ))}
              </MenuList>
            </MenuList>
          </Menu>
          
          <Button colorScheme="blue" leftIcon={<FiPlus />} size="sm">
            New Task
          </Button>
        </HStack>
      </Flex>

      <DragDropContext onDragEnd={onDragEnd}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <KanbanColumn 
            title="To Do" 
            tasks={groupedTasks['todo']} 
            status="todo" 
            projectMap={projectMap} 
          />
          <KanbanColumn 
            title="In Progress" 
            tasks={groupedTasks['in-progress']} 
            status="in-progress" 
            projectMap={projectMap} 
          />
          <KanbanColumn 
            title="Review" 
            tasks={groupedTasks['review']} 
            status="review" 
            projectMap={projectMap} 
          />
          <KanbanColumn 
            title="Completed" 
            tasks={groupedTasks['done']} 
            status="done" 
            projectMap={projectMap} 
          />
        </SimpleGrid>
      </DragDropContext>
    </Box>
  );
} 