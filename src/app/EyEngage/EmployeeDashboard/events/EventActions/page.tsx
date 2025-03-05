import { Comment, ThumbUp, GroupAdd } from '@mui/icons-material';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function EventActions({ event, setEvents }) {
    const [isCommenting, setIsCommenting] = useState(false);
    const [newComment, setNewComment] = useState('');

    const handleAction = (action) => {
        const updatedEvent = { ...event };

        switch (action) {
            case 'comment':
                setIsCommenting(true);
                break;
            case 'interested':
                updatedEvent.interested += 1;
                toast.success('Vous êtes intéressé!');
                break;
            case 'participate':
                updatedEvent.participants += 1;
                toast.success('Vous participez!');
                break;
            default:
                break;
        }

        setEvents(prevEvents => prevEvents.map(e => e.id === event.id ? updatedEvent : e));
    };

    const handleCommentSubmit = () => {
        if (newComment.trim()) {
            const updatedEvent = { ...event };
            updatedEvent.comments.push(newComment);
            toast.success('Commentaire ajouté!');
            setNewComment('');
            setIsCommenting(false);
            setEvents(prevEvents => prevEvents.map(e => e.id === event.id ? updatedEvent : e));
        } else {
            toast.error('Veuillez entrer un commentaire valide.');
        }
    };

    return (
        <div className="flex gap-6 mt-4">
            <button
                onClick={() => handleAction('comment')}
                className="flex items-center gap-3 bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-600 transition"
            >
                <Comment className="text-lg" /> Commenter
            </button>
            <button
                onClick={() => handleAction('interested')}
                className="flex items-center gap-3 bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-600 transition"
            >
                <ThumbUp className="text-lg" /> Intéressé ({event.interested})
            </button>
            <button
                onClick={() => handleAction('participate')}
                className="flex items-center gap-3 bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-600 transition"
            >
                <GroupAdd className="text-lg" /> Participer ({event.participants})
            </button>

            {isCommenting && (
                <div className="mt-4">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full p-3 border rounded-lg resize-none"
                        rows="4"
                        placeholder="Écrivez votre commentaire..."
                    ></textarea>
                    <button
                        onClick={handleCommentSubmit}
                        className="mt-2 bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-600 transition"
                    >
                        Ajouter le commentaire
                    </button>
                    <button
                        onClick={() => setIsCommenting(false)}
                        className="mt-2 ml-2 text-red-500 hover:underline"
                    >
                        Annuler
                    </button>
                </div>
            )}
        </div>
    );
}
