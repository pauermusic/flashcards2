import { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const StudyScreen = () => {
  // Define questions and answers
  const questions = [
    {
      question: 'What is the capital of France?',
      options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
      correctAnswer: 'Paris',
    },
    {
      question: 'Who wrote "Hamlet"?',
      options: ['Shakespeare', 'Dickens', 'Hemingway', 'Austen'],
      correctAnswer: 'Shakespeare',
    },
    {
      question: 'What is the largest ocean on Earth?',
      options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
      correctAnswer: 'Pacific',
    },
  ];

  // Track the current question index and score
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  // Function to handle answer selection
  const handleAnswer = (selectedAnswer: string) => {
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1); // Increment score if correct
    }

    // Move to the next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      alert(`Quiz Over! Your score is: ${score + 1}`);
      setCurrentQuestionIndex(0);
      setScore(0); // Reset score after the quiz ends
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{currentQuestion.question}</Text>
      <View style={styles.options}>
        {currentQuestion.options.map((option, index) => (
          <Button
            key={index}
            title={option}
            onPress={() => handleAnswer(option)}
          />
        ))}
      </View>
      <Text style={styles.score}>Score: {score}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  question: {
    fontSize: 20,
    marginBottom: 20,
  },
  options: {
    marginBottom: 20,
  },
  score: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StudyScreen;
