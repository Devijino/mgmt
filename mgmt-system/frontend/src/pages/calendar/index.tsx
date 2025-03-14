import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Badge,
  SimpleGrid,
  VStack,
  HStack,
  IconButton,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Tooltip
} from '@chakra-ui/react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiFilter,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiInfo
} from 'react-icons/fi';
import { useProjects } from '@/context/ProjectContext';
import { Task, Project } from '@/context/ProjectContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, isSameDay, addMonths, subMonths } from 'date-fns';

// Calendar Day component
const CalendarDay = ({ day, currentMonth, tasks, onClick, isSelected }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isCurrentDay = isToday(day);
  
  // Filter tasks for this day
  const dayTasks = tasks.filter(task => 
    isSameDay(parseISO(task.dueDate), day)
  );
  
  // Prioritize tasks
  const urgentTasks = dayTasks.filter(task => task.priority === 'urgent');
  const highTasks = dayTasks.filter(task => task.priority === 'high');
  const otherTasks = dayTasks.filter(task => 
    task.priority !== 'urgent' && task.priority !== 'high'
  );
  
  // Determine if there are overdue tasks
  const hasOverdueTasks = dayTasks.some(task => 
    parseISO(task.dueDate) < new Date() && task.status !== 'done'
  );
  
  return (
    <Box
      bg={isSelected ? 'blue.50' : isCurrentMonth ? bgColor : 'gray.50'}
      borderWidth="1px"
      borderColor={isSelected ? 'blue.400' : isCurrentDay ? 'blue.300' : borderColor}
      borderRadius="md"
      p={2}
      onClick={() => onClick(day)}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        borderColor: 'blue.400',
        transform: 'translateY(-2px)',
        boxShadow: 'sm'
      }}
      position="relative"
      height="120px"
      overflow="hidden"
    >
      <Text 
        fontSize="sm" 
        fontWeight={isCurrentDay ? 'bold' : 'normal'}
        color={!isCurrentMonth ? textColor : undefined}
      >
        {format(day, 'd')}
      </Text>
      
      {dayTasks.length > 0 && (
        <VStack spacing={1} mt={2} align="stretch">
          {urgentTasks.length > 0 && (
            <Badge colorScheme="red" fontSize="xs" borderRadius="full" px={1.5}>
              {urgentTasks.length} urgent
            </Badge>
          )}
          
          {highTasks.length > 0 && (
            <Badge colorScheme="orange" fontSize="xs" borderRadius="full" px={1.5}>
              {highTasks.length} high
            </Badge>
          )}
          
          {otherTasks.length > 0 && (
            <Badge colorScheme="blue" fontSize="xs" borderRadius="full" px={1.5}>
              {otherTasks.length} {otherTasks.length === 1 ? 'task' : 'tasks'}
            </Badge>
          )}
          
          {dayTasks.slice(0, 1).map(task => (
            <Text 
              key={task.id} 
              fontSize="xs" 
              noOfLines={1}
              color={task.status === 'done' ? 'gray.400' : undefined}
              textDecoration={task.status === 'done' ? 'line-through' : undefined}
            >
              {task.title}
            </Text>
          ))}
          
          {dayTasks.length > 1 && (
            <Text fontSize="xs" color={textColor}>
              +{dayTasks.length - 1} more
            </Text>
          )}
        </VStack>
      )}
      
      {hasOverdueTasks && (
        <Box 
          position="absolute" 
          top="2px" 
          right="2px"
          width="8px"
          height="8px"
          borderRadius="full"
          bg="red.500"
        />
      )}
    </Box>
  );
};

// Task Details Modal component
const TaskDetailsModal = ({ isOpen, onClose, selectedDay, tasks, projects }) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const { updateTask, deleteTask } = useProjects();
  
  // Filter tasks for the selected day
  const dayTasks = selectedDay 
    ? tasks.filter(task => isSameDay(parseISO(task.dueDate), selectedDay))
    : [];
  
  // Group tasks by priority
  const groupedTasks = {
    urgent: dayTasks.filter(task => task.priority === 'urgent'),
    high: dayTasks.filter(task => task.priority === 'high'),
    medium: dayTasks.filter(task => task.priority === 'medium'),
    low: dayTasks.filter(task => task.priority === 'low')
  };
  
  // Get project name by id
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };
  
  // Handle task status toggle
  const handleStatusToggle = (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateTask(task.id, { status: newStatus });
  };
  
  // Handle task deletion
  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
      if (dayTasks.length <= 1) {
        onClose();
      }
    }
  };
  
  const priorityOrder = ['urgent', 'high', 'medium', 'low'];
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {selectedDay ? format(selectedDay, 'MMMM d, yyyy') : ''}
          {selectedDay && isToday(selectedDay) && (
            <Badge colorScheme="blue" ml={2}>Today</Badge>
          )}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {dayTasks.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Text mb={3}>No tasks scheduled for this day</Text>
              <Button leftIcon={<FiPlus />} size="sm">
                Add Task
              </Button>
            </Box>
          ) : (
            <VStack spacing={4} align="stretch">
              {priorityOrder.map(priority => (
                groupedTasks[priority].length > 0 && (
                  <Box key={priority}>
                    <Text 
                      fontSize="xs" 
                      textTransform="uppercase" 
                      fontWeight="bold" 
                      color={textColor}
                      mb={2}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                    </Text>
                    
                    <VStack spacing={2} align="stretch">
                      {groupedTasks[priority].map(task => (
                        <Flex 
                          key={task.id} 
                          p={3} 
                          borderWidth="1px" 
                          borderRadius="md" 
                          justifyContent="space-between"
                          alignItems="center"
                          bg={bgColor}
                        >
                          <Box flex="1">
                            <Flex alignItems="center">
                              <Text 
                                fontWeight="medium"
                                textDecoration={task.status === 'done' ? 'line-through' : undefined}
                                color={task.status === 'done' ? textColor : undefined}
                              >
                                {task.title}
                              </Text>
                              <Tooltip label={task.description}>
                                <IconButton
                                  aria-label="Task info"
                                  icon={<FiInfo />}
                                  size="xs"
                                  ml={1}
                                  variant="ghost"
                                />
                              </Tooltip>
                            </Flex>
                            <Text fontSize="xs" color={textColor}>
                              {getProjectName(task.projectId)}
                            </Text>
                          </Box>
                          
                          <HStack>
                            <IconButton
                              aria-label={task.status === 'done' ? "Mark as todo" : "Mark as done"}
                              icon={<FiCheck />}
                              size="sm"
                              colorScheme={task.status === 'done' ? 'gray' : 'green'}
                              variant="ghost"
                              onClick={() => handleStatusToggle(task)}
                            />
                            <IconButton
                              aria-label="Delete task"
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDeleteTask(task.id)}
                            />
                          </HStack>
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                )
              ))}
            </VStack>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button leftIcon={<FiPlus />} colorScheme="blue">
            Add Task
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Main Calendar component
export default function Calendar() {
  const { projects } = useProjects();
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // State for current month and selected day
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Filter state
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Get all tasks from all projects
  const allTasks = projects.flatMap(p => p.tasks);
  
  // Filter tasks based on selected project and status
  const filteredTasks = allTasks.filter(task => {
    const matchesProject = filterProject === 'all' || task.projectId === filterProject;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesProject && matchesStatus;
  });
  
  // Get days of current month for the calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add days from previous and next month to fill the calendar grid
  const dayOfWeek = monthStart.getDay();
  let prevMonthDays = [];
  for (let i = dayOfWeek - 1; i >= 0; i--) {
    const day = new Date(monthStart);
    day.setDate(day.getDate() - (i + 1));
    prevMonthDays.push(day);
  }
  
  // Get next month days
  const totalDaysInGrid = Math.ceil((calendarDays.length + prevMonthDays.length) / 7) * 7;
  const nextMonthDaysCount = totalDaysInGrid - calendarDays.length - prevMonthDays.length;
  let nextMonthDays = [];
  for (let i = 0; i < nextMonthDaysCount; i++) {
    const day = new Date(monthEnd);
    day.setDate(day.getDate() + (i + 1));
    nextMonthDays.push(day);
  }
  
  // Combine all days
  const allDays = [...prevMonthDays, ...calendarDays, ...nextMonthDays];
  
  // Handle day click
  const handleDayClick = (day) => {
    setSelectedDay(day);
    onOpen();
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Go to today
  const goToToday = () => {
    setCurrentMonth(new Date());
  };
  
  // Week days
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Project filter options
  const projectOptions = [
    { id: 'all', name: 'All Projects' },
    ...projects.map(p => ({ id: p.id, name: p.name }))
  ];
  
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading as="h1" size="lg">
            Calendar
          </Heading>
          <Text color={textColor}>Schedule and manage your tasks</Text>
        </Box>
        
        <HStack spacing={4}>
          <Menu>
            <MenuButton as={Button} rightIcon={<FiFilter />} variant="outline" size="sm">
              {projectOptions.find(p => p.id === filterProject)?.name}
            </MenuButton>
            <MenuList>
              {projectOptions.map(project => (
                <MenuItem 
                  key={project.id} 
                  onClick={() => setFilterProject(project.id)}
                >
                  {project.name}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          
          <Menu>
            <MenuButton as={Button} rightIcon={<FiFilter />} variant="outline" size="sm">
              Status: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setFilterStatus('all')}>All</MenuItem>
              <MenuItem onClick={() => setFilterStatus('todo')}>To Do</MenuItem>
              <MenuItem onClick={() => setFilterStatus('in-progress')}>In Progress</MenuItem>
              <MenuItem onClick={() => setFilterStatus('review')}>Review</MenuItem>
              <MenuItem onClick={() => setFilterStatus('done')}>Done</MenuItem>
            </MenuList>
          </Menu>
          
          <Button leftIcon={<FiPlus />} colorScheme="blue" size="sm">
            Add Task
          </Button>
        </HStack>
      </Flex>
      
      {/* Calendar navigation */}
      <Flex alignItems="center" justifyContent="space-between" mb={4}>
        <HStack>
          <IconButton
            aria-label="Previous month"
            icon={<FiChevronLeft />}
            onClick={goToPreviousMonth}
            variant="ghost"
          />
          <Heading size="md">
            {format(currentMonth, 'MMMM yyyy')}
          </Heading>
          <IconButton
            aria-label="Next month"
            icon={<FiChevronRight />}
            onClick={goToNextMonth}
            variant="ghost"
          />
        </HStack>
        
        <Button 
          leftIcon={<FiCalendar />} 
          onClick={goToToday}
          size="sm"
          variant="outline"
        >
          Today
        </Button>
      </Flex>
      
      {/* Calendar grid */}
      <Box 
        borderWidth="1px" 
        borderRadius="lg" 
        borderColor={borderColor}
        overflow="hidden"
      >
        {/* Week day headers */}
        <SimpleGrid columns={7} gap={0}>
          {weekDays.map(day => (
            <Box 
              key={day} 
              p={2} 
              textAlign="center"
              fontWeight="semibold"
              fontSize="sm"
              color={textColor}
              borderBottomWidth="1px"
              borderRightWidth="1px"
              borderColor={borderColor}
              bg={useColorModeValue('gray.50', 'gray.700')}
            >
              {day}
            </Box>
          ))}
        </SimpleGrid>
        
        {/* Calendar days */}
        <SimpleGrid columns={7} gap={0} p={2}>
          {allDays.map((day, index) => (
            <Box key={index} p={1}>
              <CalendarDay 
                day={day} 
                currentMonth={currentMonth} 
                tasks={filteredTasks}
                onClick={handleDayClick}
                isSelected={selectedDay && isSameDay(day, selectedDay)}
              />
            </Box>
          ))}
        </SimpleGrid>
      </Box>
      
      {/* Task details modal */}
      <TaskDetailsModal 
        isOpen={isOpen} 
        onClose={onClose} 
        selectedDay={selectedDay}
        tasks={filteredTasks}
        projects={projects}
      />
    </Box>
  );
}

// Check icon component for the modal
const FiCheck = (props) => (
  <svg 
    stroke="currentColor" 
    fill="none" 
    strokeWidth="2" 
    viewBox="0 0 24 24" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    height="1em" 
    width="1em" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
); 