import React from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Icon,
  Badge,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Divider,
  HStack,
  Avatar,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiCalendar, 
  FiCheckCircle,
  FiAlertCircle,
  FiClock
} from 'react-icons/fi';
import { useProjects } from '@/context/ProjectContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

export default function Dashboard() {
  const { projects, projectStats } = useProjects();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const greenColor = useColorModeValue('green.500', 'green.300');
  const redColor = useColorModeValue('red.500', 'red.300');

  // Statistics
  const stats = [
    {
      label: 'Total Projects',
      value: projectStats.totalProjects,
      icon: FiCalendar,
      color: 'blue.500',
    },
    {
      label: 'Tasks Completed',
      value: projectStats.tasksCompleted,
      icon: FiCheckCircle,
      color: 'green.500',
      change: '+5%',
      isIncreased: true,
    },
    {
      label: 'Overdue Tasks',
      value: projectStats.tasksDue,
      icon: FiAlertCircle,
      color: 'red.500',
      change: '+2%',
      isIncreased: false,
    },
    {
      label: 'Avg. Completion Time',
      value: '4.2',
      suffix: 'days',
      icon: FiClock,
      color: 'purple.500',
      change: '-8%',
      isIncreased: true,
    },
  ];

  // Doughnut chart data for project status
  const projectStatusData = {
    labels: ['Active', 'Planning', 'On Hold', 'Completed'],
    datasets: [
      {
        data: [
          projects.filter(p => p.status === 'active').length,
          projects.filter(p => p.status === 'planning').length,
          projects.filter(p => p.status === 'on-hold').length,
          projects.filter(p => p.status === 'completed').length,
        ],
        backgroundColor: ['#4299E1', '#ECC94B', '#F687B3', '#48BB78'],
        borderWidth: 0,
      },
    ],
  };

  // Line chart data for task completion
  const taskCompletionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [12, 19, 15, 17, 22, 28],
        borderColor: '#4299E1',
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
        tension: 0.4,
      },
    ],
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading as="h1" size="lg">
            Dashboard
          </Heading>
          <Text color={textColor}>Welcome back! Here's an overview of your projects.</Text>
        </Box>
      </Flex>

      {/* Stats Section */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {stats.map((stat, index) => (
          <Card key={index} bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
            <CardBody>
              <Flex justifyContent="space-between" alignItems="center">
                <Stat>
                  <StatLabel color={textColor}>{stat.label}</StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold" mt={1}>
                    {stat.value}
                    {stat.suffix && <span style={{ fontSize: '16px' }}> {stat.suffix}</span>}
                  </StatNumber>
                  {stat.change && (
                    <StatHelpText color={stat.isIncreased ? greenColor : redColor}>
                      <Flex alignItems="center">
                        <Icon 
                          as={stat.isIncreased ? FiTrendingUp : FiTrendingDown} 
                          mr={1} 
                        />
                        {stat.change}
                      </Flex>
                    </StatHelpText>
                  )}
                </Stat>
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  bg={`${stat.color}20`}
                  color={stat.color}
                  borderRadius="full"
                  boxSize="50px"
                >
                  <Icon as={stat.icon} boxSize={5} />
                </Flex>
              </Flex>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Charts and Tables Section */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={8}>
        {/* Project Status Chart */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
          <CardHeader pb={0}>
            <Heading size="md">Project Status</Heading>
          </CardHeader>
          <CardBody>
            <Box h="250px">
              <Doughnut 
                data={projectStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </Box>
          </CardBody>
        </Card>

        {/* Task Completion Chart */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
          <CardHeader pb={0}>
            <Heading size="md">Task Completion Trend</Heading>
          </CardHeader>
          <CardBody>
            <Box h="250px">
              <Line 
                data={taskCompletionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </Box>
          </CardBody>
        </Card>
      </Grid>

      {/* Recent Projects Section */}
      <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg" mb={8}>
        <CardHeader>
          <Heading size="md">Recent Projects</Heading>
        </CardHeader>
        <CardBody px={0} py={0}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Project Name</Th>
                <Th>Status</Th>
                <Th>Team</Th>
                <Th>Progress</Th>
                <Th>Due Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {projects.slice(0, 5).map((project) => (
                <Tr key={project.id}>
                  <Td>
                    <Text fontWeight="medium">{project.name}</Text>
                    <Text fontSize="sm" color={textColor}>{project.category}</Text>
                  </Td>
                  <Td>
                    <Badge 
                      colorScheme={
                        project.status === 'active' ? 'blue' : 
                        project.status === 'planning' ? 'yellow' : 
                        project.status === 'on-hold' ? 'pink' : 
                        'green'
                      }
                      borderRadius="full"
                      px={2}
                      py={1}
                    >
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing="-2">
                      {project.team.slice(0, 3).map((member, idx) => (
                        <Avatar 
                          key={idx} 
                          name={member} 
                          size="sm" 
                          borderWidth="2px" 
                          borderColor={cardBg} 
                        />
                      ))}
                      {project.team.length > 3 && (
                        <Avatar 
                          size="sm" 
                          bg="gray.400" 
                          borderWidth="2px" 
                          borderColor={cardBg}
                        >
                          <Text fontSize="xs" fontWeight="bold">
                            +{project.team.length - 3}
                          </Text>
                        </Avatar>
                      )}
                    </HStack>
                  </Td>
                  <Td>
                    <Box>
                      <Text mb={1} fontSize="sm" fontWeight="medium">
                        {project.completionPercentage}%
                      </Text>
                      <Progress 
                        value={project.completionPercentage} 
                        size="sm" 
                        colorScheme="blue" 
                        borderRadius="full"
                      />
                    </Box>
                  </Td>
                  <Td>
                    <Text color={new Date(project.endDate) < new Date() ? redColor : undefined}>
                      {new Date(project.endDate).toLocaleDateString()}
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Quick Tasks Section */}
      <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
        <CardHeader>
          <Heading size="md">Upcoming Tasks</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {projects.flatMap(p => p.tasks)
              .filter(task => task.status !== 'done')
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 6)
              .map(task => (
                <Box 
                  key={task.id} 
                  p={4} 
                  borderWidth="1px" 
                  borderRadius="md" 
                  borderColor={borderColor}
                  _hover={{ 
                    borderColor: 'blue.500',
                    transform: 'translateY(-2px)',
                    boxShadow: 'sm'
                  }}
                  transition="all 0.2s"
                >
                  <Flex mb={2} justify="space-between" align="center">
                    <Badge 
                      colorScheme={
                        task.priority === 'urgent' ? 'red' : 
                        task.priority === 'high' ? 'orange' : 
                        task.priority === 'medium' ? 'blue' :
                        'green'
                      }
                      borderRadius="full"
                      px={2}
                    >
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                    <Badge 
                      colorScheme={
                        task.status === 'todo' ? 'gray' : 
                        task.status === 'in-progress' ? 'blue' : 
                        task.status === 'review' ? 'purple' :
                        'green'
                      }
                      borderRadius="full"
                      px={2}
                    >
                      {task.status === 'in-progress' ? 'In Progress' : 
                        task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Badge>
                  </Flex>
                  <Text fontWeight="semibold" mb={1}>{task.title}</Text>
                  <Text fontSize="sm" noOfLines={2} color={textColor} mb={3}>
                    {task.description}
                  </Text>
                  <Flex justify="space-between" align="center" fontSize="sm">
                    <Text color={textColor}>
                      Project: {projects.find(p => p.id === task.projectId)?.name}
                    </Text>
                    <Text 
                      color={new Date(task.dueDate) < new Date() ? redColor : textColor}
                      fontWeight={new Date(task.dueDate) < new Date() ? "semibold" : "normal"}
                    >
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Text>
                  </Flex>
                </Box>
              ))}
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
} 