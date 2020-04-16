import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

interface Props {
  open: boolean;
  content: string;
  onClose: () => void;
}

export default function ResultDialog(props: Props) {
  const { open, onClose } = props;

  return (
    <Dialog open={open} onClose={() => onClose()} aria-labelledby="Sign and Verify Dialog">
      <DialogTitle id="alert-dialog-title">{"Use Google's location service?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Let Google help apps determine location. This means sending anonymous location data to
          Google, even when no apps are running.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()} color="primary" autoFocus={true}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}
