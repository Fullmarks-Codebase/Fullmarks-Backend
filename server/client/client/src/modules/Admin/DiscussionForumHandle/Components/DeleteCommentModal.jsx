export default function DeleteCommentModal({ handleDeleteComment }) {
  return (
    <div
      className='modal fade'
      id='deleteCommentModal'
      tabIndex='-1'
      role='dialog'
      aria-labelledby='deleteCommentModalLabel'
      aria-hidden='true'
    >
      <div className='modal-dialog' role='document'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title' id='deleteCommentModalLabel'>
              Delete Comment
            </h5>
            <button
              type='button'
              className='close'
              data-dismiss='modal'
              aria-label='Close'
            >
              <span aria-hidden='true'>&times;</span>
            </button>
          </div>
          <div className='modal-body'>...</div>
          <div className='modal-footer'>
            <button
              type='button'
              className='btn btn-secondary'
              data-dismiss='modal'
            >
              Close
            </button>
            <button
              type='button'
              onClick={handleDeleteComment}
              className='btn btn-primary'
            >
              Delete Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
