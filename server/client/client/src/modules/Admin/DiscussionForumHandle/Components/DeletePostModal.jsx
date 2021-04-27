export default function DeletePostModal({ handleDeletePost }) {
  return (
    <div
      className='modal fade'
      id='deletePostModal'
      tabIndex='-1'
      role='dialog'
      aria-labelledby='deletePostModalLabel'
      aria-hidden='true'
    >
      <div className='modal-dialog' role='document'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title' id='deletePostModalLabel'>
              Delete Post
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
              onClick={handleDeletePost}
              className='btn btn-primary'
            >
              Delete Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
