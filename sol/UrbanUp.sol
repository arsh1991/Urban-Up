
pragma solidity ^ 0.4.10;


contract Project {
    
    string public projectTitle;
	address public projectOwner;
	address public pro;
	
    bool recovered = false;
	
	uint public projectAmount;
	uint public depositAmount;
	
	
	uint public paidAmount;
	
	uint public projectTimeInterval;
	uint public deadlineTime;
	
	uint public backoffInterval;
	uint public backoffTime;
    
	enum State {
		Open,
		InProgress,
		Complete, 
		Cancelled
	}
	
	State public state;

	modifier inState(State s) {
		require(s == state);
		_;
	}
	
	modifier notComplete(State s) {
		require(s != state);
		_;
	}
	
	modifier onlyprojectOwner() {
		require(msg.sender == projectOwner);
		_;
	}
	
	modifier onlyPro() {
		require(msg.sender == pro);
		_;
	}
	
	modifier onlyprojectOwnerOrPro() {
		require((msg.sender == projectOwner) || (msg.sender == pro));
		_;
	}

	event Created(address indexed contractAddress, address projectOwner, uint depositAmount, uint projectTimeInterval, uint backoffInterval,string projectTitle );
	event FundsAdded(address from, uint amount); 
	event projectOwnerStatement(string statement);
	event proStatement(string statement);
	event FundsRecovered();
	event Committed(address pro);
	
	
	event FundsReleased(uint amount);
	event Closed();
	event Unclosed();
	
	event AutoreleaseDelayed();
	event AutoreleaseTriggered();

	function Project(address _projectOwner, uint _depositAmount, uint _projectTimeInterval, uint _backoffInterval,string _projectTitle, string description)
	public
	payable {
		Created(this, _projectOwner, _depositAmount, _projectTimeInterval,_backoffInterval, _projectTitle);

		if (msg.value > 0) {
		    
			FundsAdded(tx.origin, msg.value);
		    projectAmount += msg.value;
		}
		
		projectTitle = _projectTitle;

		state = State.Open;
		projectOwner = _projectOwner;
		depositAmount = _depositAmount;

		projectTimeInterval = _projectTimeInterval;

		if (bytes(description).length > 0)
		    projectOwnerStatement(description);
	}


	function getFullState()
	public
	constant
	returns(address, string, State, address, uint, uint, uint, uint, uint, uint,uint,uint) {
		return (projectOwner, projectTitle, state, pro, this.balance, depositAmount, projectAmount, paidAmount, projectTimeInterval, deadlineTime, backoffInterval, backoffTime);
	}

	function addFunds()
	public
	payable {
		require(msg.value > 0);

		FundsAdded(msg.sender, msg.value);
		projectAmount += msg.value;
		
		if (state == State.Complete) {
			state = State.InProgress;
			Unclosed();
		}
	}

	function recoverFunds()
	public
	onlyprojectOwnerOrPro()
	notComplete(State.Complete) {
	    recovered = true;
	    if(depositAmount !=0){
	        pro.transfer(depositAmount);
	        FundsReleased(depositAmount);
	        projectOwner.transfer(projectAmount - depositAmount);
	        FundsReleased(projectAmount - depositAmount);
	        state = State.Cancelled;
	        Closed();
	    }
		
		selfdestruct(projectOwner);
	}

	function commit()
	public
	inState(State.Open)
	payable{
		require(msg.value == depositAmount);

		if (msg.value > 0) {
			FundsAdded(msg.sender, msg.value);
			projectAmount += msg.value;
		}

		pro = msg.sender;
		state = State.InProgress;
		Committed(pro);
		deadlineTime = now + projectTimeInterval;
	    backoffTime= now + backoffInterval;
	    
	}

	function internalRelease(uint amount)
	private
	inState(State.InProgress) {
		pro.transfer(amount);

		paidAmount += amount;
		
		FundsReleased(amount);

		if (this.balance == 0) {
			state = State.Complete;
			Closed();
		}
	}

	function release(uint percent)
	public
	inState(State.InProgress)
	onlyprojectOwner() {
	    uint amount = percent/100 * projectAmount;
		internalRelease(amount);
	}

	function logProjectOwnerStatement(string statement)
	public
	onlyprojectOwner() {
	    projectOwnerStatement(statement);
	}

	function logProStatement(string statement)
	public
	onlyPro() {
		proStatement(statement);
	}


	function triggerAutorelease()
	public
	onlyPro()
	inState(State.InProgress) {
		require(now >= deadlineTime);

        AutoreleaseTriggered();
		internalRelease(this.balance);
	}
}

contract ProjectFactory {
	event NewProject(address indexed newProjectAddress, address projectOwner, uint depositAmount, uint projectTimeInterval,uint backoffInterval, string projectTitle, string description);
	address[]public Projects;

	function getProjectCount()
	public
	constant
	returns(uint) {
		return Projects.length;
	}

	function newProject(address projectOwner, uint depositAmount, uint projectTimeInterval,uint backoffInterval ,string projectTitle, string description)
	public
	payable
	returns(address) {
		address projectAddress = (new Project).value(msg.value)(projectOwner, depositAmount, projectTimeInterval,backoffInterval, projectTitle, description);
		NewProject(projectAddress, projectOwner, depositAmount, projectTimeInterval,backoffInterval, projectTitle, description);

		Projects.push(projectAddress);

		return projectAddress;
	}
}


