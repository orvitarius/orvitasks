import React from 'react';
import { render } from '@testing-library/react';
import TaskList from './TaskList';

describe('TaskList component', () => {
  test('renders without error', () => {
    render(<TaskList />);
  });

  test('displays the correct title', () => {
    const title = 'My Task List';
    const { getByText } = render(<TaskList title={title} />);
    expect(getByText(title)).toBeInTheDocument();
  });

  test('displays the correct number of tasks', () => {
    const tasks = [
      { id: 1, title: 'Task 1' },
      { id: 2, title: 'Task 2' },
      { id: 3, title: 'Task 3' },
    ];
    const { getAllByTestId } = render(<TaskList tasks={tasks} />);
    expect(getAllByTestId('task-item')).toHaveLength(tasks.length);
  });

  // Add more tests as needed
});