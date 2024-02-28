const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.deleteTasksScheduledFunction = functions.pubsub.schedule('every sunday 00:00').onRun((context) => {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const tasksRef = admin.firestore().collection('tasks');
    const query = tasksRef.where('completed', '==', true).where('completion_date', '<=', fiveDaysAgo);

    return query.get()
        .then((snapshot) => {
            const batch = admin.firestore().batch();
            snapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            return batch.commit();
        })
        .catch((error) => {
            console.error('Error deleting tasks:', error);
            throw error;
        });
});